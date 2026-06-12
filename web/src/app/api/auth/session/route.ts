import { isAdmin } from "@/auth";

export async function GET() {
  return Response.json({ admin: await isAdmin() });
}
