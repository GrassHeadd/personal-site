import { checkPassword, createSession } from "@/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (typeof body?.password !== "string" || !checkPassword(body.password)) {
    return Response.json({ error: "Unauthorised" }, { status: 401 });
  }
  await createSession();
  return new Response(null, { status: 204 });
}
