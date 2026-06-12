import { serverError, unauthorized } from "@/shared/db";
import { isAdmin } from "@/shared/auth";
import { listNotes, removeNote, upsertNote } from "@/features/calendar/model";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const KINDS = ["day", "week", "month", "year"];

export async function GET(req: Request) {
  if (!(await isAdmin())) return unauthorized();

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (!from || !to || !DATE_RE.test(from) || !DATE_RE.test(to)) {
    return Response.json(
      { error: "from and to (YYYY-MM-DD) required" },
      { status: 400 },
    );
  }
  try {
    return Response.json(await listNotes(from, to));
  } catch (e) {
    return serverError(e);
  }
}

/* upsert by (kind, anchor); an empty note clears the scribble */
export async function PUT(req: Request) {
  if (!(await isAdmin())) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body || !KINDS.includes(body.kind) || !DATE_RE.test(body.anchor ?? "")) {
    return Response.json(
      { error: "kind and anchor (YYYY-MM-DD) required" },
      { status: 400 },
    );
  }

  const note = typeof body.note === "string" ? body.note.trim() : "";
  try {
    if (!note) {
      await removeNote(body.kind, body.anchor);
      return new Response(null, { status: 204 });
    }
    const row = await upsertNote({
      kind: body.kind,
      anchor: body.anchor,
      note,
      braindump_ref:
        typeof body.braindump_ref === "string" && body.braindump_ref.trim()
          ? body.braindump_ref.trim()
          : null,
    });
    return Response.json(row);
  } catch (e) {
    return serverError(e);
  }
}
