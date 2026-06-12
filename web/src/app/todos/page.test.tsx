// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Todo } from "@/features/todos/api";

const { getTodos, createTodo, updateTodo, deleteTodo } = vi.hoisted(() => ({
  getTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
}));

vi.mock("@/features/todos/api", () => ({ getTodos, createTodo, updateTodo, deleteTodo }));

/* chrome around the list is not under test */
vi.mock("@/shared/components/Navbar", () => ({ default: () => null }));
vi.mock("@/shared/components/Squiggle", () => ({ default: () => null }));
vi.mock("@/shared/components/Footer", () => ({ default: () => null }));

import TodosPage from "./page";

const make = (over: Partial<Todo>): Todo => ({
  id: "id-" + (over.title ?? Math.random()),
  title: "untitled",
  done: false,
  done_at: null,
  created_at: "2026-06-01T00:00:00Z",
  updated_at: "2026-06-01T00:00:00Z",
  ...over,
});

const sessionFetch = vi.fn();

const renderPage = async (admin: boolean, todos: Todo[]) => {
  sessionFetch.mockResolvedValue(Response.json({ admin }));
  getTodos.mockResolvedValue(todos);
  render(<TodosPage />);
  await waitFor(() => expect(getTodos).toHaveBeenCalled());
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", sessionFetch);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("todos page", () => {
  it("shows open items, and crossed-off ones in their own pile", async () => {
    await renderPage(false, [
      make({ title: "water the plants" }),
      make({ title: "learn the accordion", done: true, done_at: "2026-06-02T00:00:00Z" }),
    ]);

    expect(await screen.findByText("water the plants")).toBeInTheDocument();
    expect(screen.getByText(/crossed off/)).toBeInTheDocument();
    expect(screen.getByText("learn the accordion")).toHaveClass("strike-wavy");
    expect(screen.getByText("water the plants")).not.toHaveClass("strike-wavy");
  });

  it("hides editing entirely for visitors", async () => {
    await renderPage(false, [make({ title: "water the plants" })]);
    await screen.findByText("water the plants");

    expect(screen.queryByPlaceholderText(/write something down/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/scrap/)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/cross off/)).toBeDisabled();
  });

  it("shows the empty state", async () => {
    await renderPage(false, []);
    expect(await screen.findByText(/nothing on the list yet/)).toBeInTheDocument();
  });

  it("shows an error note when loading fails", async () => {
    sessionFetch.mockResolvedValue(Response.json({ admin: false }));
    getTodos.mockRejectedValue(new Error("boom"));
    render(<TodosPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn't load/);
  });

  it("lets the admin add a todo", async () => {
    const user = userEvent.setup();
    await renderPage(true, []);
    createTodo.mockResolvedValue(make({ title: "buy stamps" }));

    await user.type(
      await screen.findByPlaceholderText(/write something down/),
      "buy stamps",
    );
    await user.click(screen.getByRole("button", { name: "+ add" }));

    expect(createTodo).toHaveBeenCalledWith("buy stamps");
    expect(await screen.findByText("buy stamps")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/write something down/)).toHaveValue("");
  });

  it("crosses an item off optimistically", async () => {
    const user = userEvent.setup();
    const todo = make({ title: "water the plants" });
    await renderPage(true, [todo]);
    /* a hanging promise keeps the request in flight while we assert */
    updateTodo.mockReturnValue(new Promise(() => {}));

    await user.click(await screen.findByLabelText(/cross off "water the plants"/));

    expect(updateTodo).toHaveBeenCalledWith(todo.id, { done: true });
    expect(screen.getByText("water the plants")).toHaveClass("strike-wavy");
    expect(screen.getByRole("heading", { name: /crossed off/ })).toBeInTheDocument();
  });

  it("un-crosses the item again if the server says no", async () => {
    const user = userEvent.setup();
    const todo = make({ title: "water the plants" });
    await renderPage(true, [todo]);
    updateTodo.mockRejectedValue(new Error("boom"));

    await user.click(await screen.findByLabelText(/cross off "water the plants"/));

    await waitFor(() =>
      expect(screen.getByText("water the plants")).not.toHaveClass("strike-wavy"),
    );
  });

  it("lets the admin scrap an item", async () => {
    const user = userEvent.setup();
    const todo = make({ title: "water the plants" });
    await renderPage(true, [todo]);
    deleteTodo.mockResolvedValue(undefined);

    await user.click(await screen.findByLabelText(/scrap "water the plants"/));

    expect(deleteTodo).toHaveBeenCalledWith(todo.id);
    expect(screen.queryByText("water the plants")).not.toBeInTheDocument();
  });

  it("uncrossing moves an item back to the open list", async () => {
    const user = userEvent.setup();
    const todo = make({
      title: "learn the accordion",
      done: true,
      done_at: "2026-06-02T00:00:00Z",
    });
    await renderPage(true, [todo]);
    updateTodo.mockResolvedValue({ ...todo, done: false, done_at: null });

    await user.click(await screen.findByLabelText(/un-cross "learn the accordion"/));

    expect(updateTodo).toHaveBeenCalledWith(todo.id, { done: false });
    expect(screen.getByText("learn the accordion")).not.toHaveClass("strike-wavy");
    expect(screen.queryByText(/crossed off/)).not.toBeInTheDocument();
  });
});
