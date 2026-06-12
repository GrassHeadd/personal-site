import { beforeEach, describe, expect, it, vi } from "vitest";

const { sb, isAdmin } = vi.hoisted(() => ({
  sb: vi.fn(),
  isAdmin: vi.fn(),
}));

vi.mock("@/lib/talkerinos/db", () => ({
  sb,
  unauthorized: () => Response.json({ error: "Unauthorised" }, { status: 401 }),
}));
vi.mock("@/auth", () => ({ isAdmin }));

import { GET, POST } from "./route";

const post = (body: unknown) =>
  POST(
    new Request("http://test/api/todos", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/todos", () => {
  it("returns rows, open items first in writing order", async () => {
    const rows = [{ id: "1", title: "water the plants", done: false }];
    sb.mockResolvedValue(Response.json(rows));

    const res = await GET();

    expect(sb).toHaveBeenCalledWith("todos?order=done.asc,created_at.asc");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(rows);
  });

  it("propagates database errors as 500", async () => {
    sb.mockResolvedValue(new Response("relation does not exist", { status: 500 }));

    const res = await GET();

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "relation does not exist" });
  });
});

describe("POST /api/todos", () => {
  it("rejects non-admins with 401 without touching the db", async () => {
    isAdmin.mockResolvedValue(false);

    const res = await post({ title: "sneaky" });

    expect(res.status).toBe(401);
    expect(sb).not.toHaveBeenCalled();
  });

  it("rejects a missing title", async () => {
    isAdmin.mockResolvedValue(true);

    expect((await post({})).status).toBe(400);
    expect((await post({ title: "   " })).status).toBe(400);
    expect(sb).not.toHaveBeenCalled();
  });

  it("rejects a malformed JSON body", async () => {
    isAdmin.mockResolvedValue(true);

    const res = await POST(
      new Request("http://test/api/todos", { method: "POST", body: "not json" }),
    );

    expect(res.status).toBe(400);
  });

  it("creates a todo from a trimmed title and returns 201", async () => {
    isAdmin.mockResolvedValue(true);
    const row = { id: "1", title: "buy stamps", done: false };
    sb.mockResolvedValue(Response.json([row]));

    const res = await post({ title: "  buy stamps  " });

    expect(sb).toHaveBeenCalledWith("todos", {
      method: "POST",
      body: JSON.stringify({ title: "buy stamps" }),
    });
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(row);
  });

  it("propagates database errors as 500", async () => {
    isAdmin.mockResolvedValue(true);
    sb.mockResolvedValue(new Response("nope", { status: 500 }));

    expect((await post({ title: "x" })).status).toBe(500);
  });
});
