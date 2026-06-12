import { z } from "zod";
import { checkPassword, createSession } from "@/shared/auth";

const loginBody = z.object({ password: z.string() });

export async function POST(req: Request) {
  const body = loginBody.safeParse(await req.json().catch(() => null));
  if (!body.success || !checkPassword(body.data.password)) {
    return Response.json({ error: "Unauthorised" }, { status: 401 });
  }
  await createSession();
  return new Response(null, { status: 204 });
}
