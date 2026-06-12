import { serverError, unauthorized } from "@/shared/db";
import { badRequest } from "@/shared/validation";
import { isAdmin } from "@/shared/auth";
import { insertEvent, listEvents } from "@/features/calendar/model";
import { eventBody, eventQuery } from "@/features/calendar/validation";

export async function GET(req: Request) {
  if (!(await isAdmin())) return unauthorized();

  const { searchParams } = new URL(req.url);

  try {
    return Response.json(
      await listEvents(eventQuery.parse(Object.fromEntries(searchParams))),
    );
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();

  const body = eventBody.safeParse(await req.json().catch(() => null));
  if (!body.success) return badRequest(body.error);

  try {
    return Response.json(await insertEvent(body.data), { status: 201 });
  } catch (e) {
    return serverError(e);
  }
}
