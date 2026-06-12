import { beforeEach, describe, expect, it, vi } from "vitest";

const { sb, isAdmin } = vi.hoisted(() => ({
  sb: vi.fn(),
  isAdmin: vi.fn(),
}));

vi.mock("@/shared/db", () => ({
  sb,
  unauthorized: () => Response.json({ error: "Unauthorised" }, { status: 401 }),
  serverError: (e: unknown) =>
    Response.json(
      { error: e instanceof Error ? e.message : "internal error" },
      { status: 500 },
    ),
}));
vi.mock("@/shared/auth", () => ({ isAdmin }));

import { GET, PUT } from "./route";

const get = (qs: string) =>
  GET(new Request(`http://test/api/notes${qs}`));

const put = (body: unknown) =>
  PUT(
    new Request("http://test/api/notes", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  );

beforeEach(() => {
  vi.clearAllMocks();
  isAdmin.mockResolvedValue(true);
});

describe("GET /api/notes", () => {
  it("requires a from/to window", async () => {
    expect((await get("")).status).toBe(400);
    expect((await get("?from=2026-06-01")).status).toBe(400);
    expect(sb).not.toHaveBeenCalled();
  });

  it("widens the window per kind so spanning notes are found", async () => {
    sb.mockResolvedValue(Response.json([]));

    const res = await get("?from=2026-06-10&to=2026-06-12");

    const q = sb.mock.calls[0][0] as string;
    expect(q).toContain("deleted_at=is.null");
    expect(q).toContain("kind.eq.day,anchor.gte.2026-06-10");
    /* the week of jun 10 is anchored on jun 7 — six days of slack */
    expect(q).toContain("kind.eq.week,anchor.gte.2026-06-04");
    expect(q).toContain("kind.eq.month,anchor.gte.2026-06-01");
    expect(q).toContain("kind.eq.year,anchor.gte.2026-01-01");
    expect(res.status).toBe(200);
  });
});

describe("PUT /api/notes", () => {
  it("rejects non-admins", async () => {
    isAdmin.mockResolvedValue(false);
    expect(
      (await put({ kind: "day", anchor: "2026-06-12", note: "x" })).status,
    ).toBe(401);
    expect(sb).not.toHaveBeenCalled();
  });

  it("rejects a bad kind or anchor", async () => {
    expect(
      (await put({ kind: "fortnight", anchor: "2026-06-12", note: "x" })).status,
    ).toBe(400);
    expect((await put({ kind: "day", anchor: "junish", note: "x" })).status).toBe(
      400,
    );
    expect(sb).not.toHaveBeenCalled();
  });

  it("upserts by kind and anchor", async () => {
    const row = {
      id: "1",
      kind: "day",
      anchor: "2026-06-12",
      note: "shipped the calendar",
      braindump_ref: null,
    };
    sb.mockResolvedValue(Response.json([row]));

    const res = await put({
      kind: "day",
      anchor: "2026-06-12",
      note: "shipped the calendar",
    });

    expect(sb).toHaveBeenCalledWith(
      "period_notes?on_conflict=kind,anchor",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("shipped the calendar"),
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(row);
  });

  it("treats an emptied note as a soft delete", async () => {
    sb.mockResolvedValue(new Response(null, { status: 204 }));

    const res = await put({ kind: "day", anchor: "2026-06-12", note: "   " });

    expect(sb).toHaveBeenCalledWith(
      "period_notes?kind=eq.day&anchor=eq.2026-06-12",
      expect.objectContaining({
        method: "PATCH",
        body: expect.stringContaining("deleted_at"),
      }),
    );
    expect(res.status).toBe(204);
  });
});
