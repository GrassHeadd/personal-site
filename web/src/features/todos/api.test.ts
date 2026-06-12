import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createTodo, deleteTodo, updateTodo, type Todo } from "./api";

const fetchMock = vi.fn();

const todo: Todo = {
  id: "1",
  title: "water the plants",
  note: null,
  done: false,
  done_at: null,
  created_at: "2026-06-12T00:00:00Z",
  updated_at: "2026-06-12T00:00:00Z",
};

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createTodo", () => {
  it("POSTs the title as JSON", async () => {
    fetchMock.mockResolvedValue(Response.json(todo));

    expect(await createTodo("water the plants")).toEqual(todo);
    expect(fetchMock).toHaveBeenCalledWith("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "water the plants" }),
    });
  });

  it("throws when the request fails", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));
    await expect(createTodo("x")).rejects.toThrow("Failed to create todo");
  });
});

describe("updateTodo", () => {
  it("PATCHes only the given fields", async () => {
    fetchMock.mockResolvedValue(Response.json({ ...todo, done: true }));

    await updateTodo("1", { done: true });
    expect(fetchMock).toHaveBeenCalledWith("/api/todos/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: true }),
    });
  });

  it("throws when the request fails", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 404 }));
    await expect(updateTodo("1", { done: true })).rejects.toThrow(
      "Failed to update todo",
    );
  });
});

describe("deleteTodo", () => {
  it("DELETEs by id", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await deleteTodo("1");
    expect(fetchMock).toHaveBeenCalledWith("/api/todos/1", { method: "DELETE" });
  });

  it("throws when the request fails", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));
    await expect(deleteTodo("1")).rejects.toThrow("Failed to delete todo");
  });
});
