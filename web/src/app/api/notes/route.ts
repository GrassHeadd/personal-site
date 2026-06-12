import { serverError, unauthorized } from "@/shared/db";
import { badRequest } from "@/shared/validation";
import { isAdmin } from "@/shared/auth";
import { listNotes, removeNote, upsertNote } from "@/features/calendar/model";
import { noteBody, noteQuery } from "@/features/calendar/validation";

export async function GET(req: Request) {
  if (!(await isAdmin())) return unauthorized();

  const { searchParams } = new URL(req.url);
  const query = noteQuery.safeParse(Object.fromEntries(searchParams));
  if (!query.success) return badRequest(query.error);

  try {
    const { from, to } = query.data;
    return Response.json(await listNotes(from, to));
  } catch (e) {
    return serverError(e);
  }
}

/* upsert by (kind, anchor); an empty note clears the scribble */
export async function PUT(req: Request) {
  if (!(await isAdmin())) return unauthorized();

  const body = noteBody.safeParse(await req.json().catch(() => null));
  if (!body.success) return badRequest(body.error);

  const { kind, anchor, note, braindump_ref } = body.data;
  try {
    if (!note) {
      await removeNote(kind, anchor);
      return new Response(null, { status: 204 });
    }
    const row = await upsertNote({ kind, anchor, note, braindump_ref });
    return Response.json(row);
  } catch (e) {
    return serverError(e);
  }
}
