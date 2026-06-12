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

import { GET, POST } from "./route";

const post = (body: unknown) =>
  POST(
    new Request("http://test/api/scribbles", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  );

beforeEach(() => {
  vi.clearAllMocks();
  isAdmin.mockResolvedValue(true);
});

describe("GET /api/scribbles", () => {
  it("is admin-only, even for reads", async () => {
    isAdmin.mockResolvedValue(false);
    expect((await GET()).status).toBe(401);
    expect(sb).not.toHaveBeenCalled();
  });

  it("returns the pad newest-day first", async () => {
    const rows = [{ id: "1", content: "an idea", noted_on: "2026-06-12" }];
    sb.mockResolvedValue(Response.json(rows));

    const res = await GET();

    expect(sb).toHaveBeenCalledWith(
      "scribbles?deleted_at=is.null&order=noted_on.desc,created_at.desc",
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(rows);
  });
});

describe("POST /api/scribbles", () => {
  it("rejects non-admins", async () => {
    isAdmin.mockResolvedValue(false);
    expect((await post({ content: "sneaky" })).status).toBe(401);
    expect(sb).not.toHaveBeenCalled();
  });

  it("requires content", async () => {
    expect((await post({ content: "   " })).status).toBe(400);
    expect(sb).not.toHaveBeenCalled();
  });

  it("files the scribble under today", async () => {
    const row = { id: "1", content: "an idea", noted_on: "2026-06-12" };
    sb.mockResolvedValue(Response.json([row]));

    const res = await post({ content: "an idea" });

    expect(sb).toHaveBeenCalledWith(
      "scribbles",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("noted_on"),
      }),
    );
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(row);
  });
});
