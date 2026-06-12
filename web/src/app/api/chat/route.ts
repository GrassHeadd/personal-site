import { authorized, unauthorized } from "@/shared/db";

const SYSTEM_PROMPT = `You are a helpful blog editing assistant. Your job is to help writers improve their drafts.

When the user highlights text and asks for help:
- Provide a rewritten version that improves clarity, flow, and engagement
- Keep the original voice and style
- If asked to "enhance" with no other instruction, make it more polished and professional

When no text is highlighted:
- Answer questions about the draft
- Provide general feedback and suggestions
- Help with brainstorming and ideation

Always be concise and actionable. Use plain text only, no markdown formatting.`;

const ENHANCE_PROMPT =
  "Enhance this text - make it clearer and more engaging while keeping the original voice.";

interface ChatBody {
  message?: string;
  selectedText?: string;
  fullDraft?: string;
  history?: { role: "user" | "assistant"; content: string }[];
}

export async function POST(req: Request) {
  if (!authorized(req)) return unauthorized();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
  }

  const body: ChatBody | null = await req.json().catch(() => null);
  if (!body) {
    return Response.json({ error: "invalid request" }, { status: 400 });
  }

  const messages: { role: string; content: string }[] = [
    { role: "system", content: SYSTEM_PROMPT },
  ];
  if (body.fullDraft) {
    messages.push({
      role: "system",
      content: `Current draft:\n\n${body.fullDraft}`,
    });
  }
  messages.push(...(body.history ?? []));

  let userMessage = body.message || ENHANCE_PROMPT;
  if (body.selectedText) {
    userMessage = `Selected text:\n"""\n${body.selectedText}\n"""\n\n${userMessage}`;
  }
  messages.push({ role: "user", content: userMessage });

  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      stream: true,
      messages,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    return Response.json(
      { error: `AI request failed: ${detail.slice(0, 200)}` },
      { status: 500 },
    );
  }

  const selectedText = body.selectedText;
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (chunk: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));

      const reader = upstream.body!.getReader();
      let buffer = "";
      let full = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const payload = line.slice(5).trim();
            if (payload === "[DONE]") continue;
            try {
              const delta: string =
                JSON.parse(payload).choices?.[0]?.delta?.content ?? "";
              if (delta) {
                full += delta;
                send({ Content: delta, Done: false });
              }
            } catch {
              // skip malformed lines
            }
          }
        }
        send({
          Content: "",
          Done: true,
          ...(selectedText
            ? { Suggestion: { Original: selectedText, Rewritten: full.trim() } }
            : {}),
        });
      } catch (err) {
        send({ Content: "", Done: true, Error: String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
