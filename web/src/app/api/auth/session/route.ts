import { isAdmin } from "@/shared/auth";

export async function GET() {
  return Response.json({ admin: await isAdmin() });
}
