import { beforeEach, describe, expect, it, vi } from "vitest";

const { sb, isAdmin } = vi.hoisted(() => ({
  sb: vi.fn(),
  isAdmin: vi.fn(),
}));

vi.mock("@/shared/db", () => ({
  sb,
  unauthorized: () => Response.json({ error: "Unauthorised" }, { status: 401 }),
}));
vi.mock("@/shared/auth", () => ({ isAdmin }));

import { DELETE, PATCH } from "./route";

const ID = "123e4567-e89b-12d3-a456-426614174000";

const patch = (id: string, body: unknown) =>
  PATCH(
    new Request(`http://test/api/todos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) },
  );

const del = (id: string) =>
  DELETE(new Request(`http://test/api/todos/${id}`, { method: "DELETE" }), {
    params: Promise.resolve({ id }),
  });

/* the body sb was last called with, parsed back to an object */
const sentPatch = () => JSON.parse(sb.mock.calls[0][1].body as string);

beforeEach(() => {
  vi.clearAllMocks();
  isAdmin.mockResolvedValue(true);
});

describe("PATCH /api/todos/[id]", () => {
  it("rejects non-admins with 401", async () => {
    isAdmin.mockResolvedValue(false);
    expect((await patch(ID, { done: true })).status).toBe(401);
    expect(sb).not.toHaveBeenCalled();
  });

  it("rejects a non-uuid id", async () => {
    expect((await patch("1; drop table todos", { done: true })).status).toBe(400);
    expect(sb).not.toHaveBeenCalled();
  });

  it("rejects a malformed body", async () => {
    const res = await PATCH(
      new Request(`http://test/api/todos/${ID}`, { method: "PATCH", body: "{" }),
      { params: Promise.resolve({ id: ID }) },
    );
    expect(res.status).toBe(400);
  });

  it("rejects renaming to an empty title", async () => {
    expect((await patch(ID, { title: "   " })).status).toBe(400);
    expect(sb).not.toHaveBeenCalled();
  });

  it("crossing off sets done and stamps done_at", async () => {
    sb.mockResolvedValue(Response.json([{ id: ID, done: true }]));

    const res = await patch(ID, { done: true });

    expect(sb).toHaveBeenCalledWith(`todos?id=eq.${ID}`, expect.anything());
    const sent = sentPatch();
    expect(sent.done).toBe(true);
    expect(new Date(sent.done_at).getTime()).not.toBeNaN();
    expect(res.status).toBe(200);
  });

  it("un-crossing clears done_at", async () => {
    sb.mockResolvedValue(Response.json([{ id: ID, done: false }]));

    await patch(ID, { done: false });

    const sent = sentPatch();
    expect(sent.done).toBe(false);
    expect(sent.done_at).toBeNull();
  });

  it("renames with a trimmed title and leaves done alone", async () => {
    sb.mockResolvedValue(Response.json([{ id: ID }]));

    await patch(ID, { title: "  feed the cat  " });

    const sent = sentPatch();
    expect(sent.title).toBe("feed the cat");
    expect(sent).not.toHaveProperty("done");
    expect(sent).not.toHaveProperty("done_at");
  });

  it("returns 404 when no row matches", async () => {
    sb.mockResolvedValue(Response.json([]));
    expect((await patch(ID, { done: true })).status).toBe(404);
  });

  it("propagates database errors as 500", async () => {
    sb.mockResolvedValue(new Response("nope", { status: 500 }));
    expect((await patch(ID, { done: true })).status).toBe(500);
  });
});

describe("DELETE /api/todos/[id]", () => {
  it("rejects non-admins with 401", async () => {
    isAdmin.mockResolvedValue(false);
    expect((await del(ID)).status).toBe(401);
    expect(sb).not.toHaveBeenCalled();
  });

  it("rejects a non-uuid id", async () => {
    expect((await del("not-a-uuid")).status).toBe(400);
    expect(sb).not.toHaveBeenCalled();
  });

  it("deletes and returns 204", async () => {
    sb.mockResolvedValue(new Response(null, { status: 204 }));

    const res = await del(ID);

    expect(sb).toHaveBeenCalledWith(`todos?id=eq.${ID}`, { method: "DELETE" });
    expect(res.status).toBe(204);
  });

  it("propagates database errors as 500", async () => {
    sb.mockResolvedValue(new Response("nope", { status: 500 }));
    expect((await del(ID)).status).toBe(500);
  });
});
