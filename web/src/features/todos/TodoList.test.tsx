// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Todo } from "@/features/todos/api";
import type { CalEvent } from "@/features/calendar/api";

const { createTodo, updateTodo, deleteTodo } = vi.hoisted(() => ({
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
}));

vi.mock("@/features/todos/api", () => ({ createTodo, updateTodo, deleteTodo }));

/* DayPanel (rendered when `today` is passed) pulls in the app router */
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

/* chrome around the list is not under test */
vi.mock("@/shared/components/Squiggle", () => ({ default: () => null }));
vi.mock("@/shared/components/Footer", () => ({ default: () => null }));

import TodoList from "./TodoList";

const make = (over: Partial<Todo>): Todo => ({
  id: "id-" + (over.title ?? Math.random()),
  title: "untitled",
  done: false,
  done_at: null,
  created_at: "2026-06-01T00:00:00Z",
  updated_at: "2026-06-01T00:00:00Z",
  ...over,
});

const makeEvent = (over: Partial<CalEvent>): CalEvent => ({
  id: "ev-" + Math.random(),
  date: "2026-06-12",
  title: "an event",
  note: null,
  color: "forest",
  start_time: null,
  end_time: null,
  end_date: null,
  recur: null,
  todo_id: null,
  ...over,
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("TodoList", () => {
  it("renders open items, and crossed-off ones in their own pile", () => {
    render(
      <TodoList
        canEdit={false}
        initialTodos={[
          make({ title: "water the plants" }),
          make({ title: "learn the accordion", done: true, done_at: "2026-06-02T00:00:00Z" }),
        ]}
      />,
    );

    expect(screen.getByText("water the plants")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /crossed off/ })).toBeInTheDocument();
    expect(screen.getByText("learn the accordion")).toHaveClass("strike-wavy");
    expect(screen.getByText("water the plants")).not.toHaveClass("strike-wavy");
  });

  it("hides editing entirely for visitors", () => {
    render(<TodoList canEdit={false} initialTodos={[make({ title: "water the plants" })]} />);

    expect(screen.queryByPlaceholderText(/write something down/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/scrap/)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/cross off/)).toBeDisabled();
  });

  it("shows the empty state", () => {
    render(<TodoList canEdit={false} initialTodos={[]} />);
    expect(screen.getByText(/nothing on the list yet/)).toBeInTheDocument();
  });

  it("shows an error note when the server couldn't load the list", () => {
    render(<TodoList canEdit={false} initialTodos={null} />);
    expect(screen.getByRole("alert")).toHaveTextContent(/couldn't load/);
  });

  it("lets the admin add a todo", async () => {
    const user = userEvent.setup();
    render(<TodoList canEdit initialTodos={[]} />);
    createTodo.mockResolvedValue(make({ title: "buy stamps" }));

    await user.type(screen.getByPlaceholderText(/write something down/), "buy stamps");
    await user.click(screen.getByRole("button", { name: "+ add" }));

    expect(createTodo).toHaveBeenCalledWith("buy stamps");
    expect(await screen.findByText("buy stamps")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/write something down/)).toHaveValue("");
  });

  it("crosses an item off optimistically", async () => {
    const user = userEvent.setup();
    const todo = make({ title: "water the plants" });
    render(<TodoList canEdit initialTodos={[todo]} />);
    /* a hanging promise keeps the request in flight while we assert */
    updateTodo.mockReturnValue(new Promise(() => {}));

    await user.click(screen.getByLabelText(/cross off "water the plants"/));

    expect(updateTodo).toHaveBeenCalledWith(todo.id, { done: true });
    expect(screen.getByText("water the plants")).toHaveClass("strike-wavy");
    expect(screen.getByRole("heading", { name: /crossed off/ })).toBeInTheDocument();
  });

  it("un-crosses the item again if the server says no", async () => {
    const user = userEvent.setup();
    const todo = make({ title: "water the plants" });
    render(<TodoList canEdit initialTodos={[todo]} />);
    updateTodo.mockRejectedValue(new Error("boom"));

    await user.click(screen.getByLabelText(/cross off "water the plants"/));

    await waitFor(() =>
      expect(screen.getByText("water the plants")).not.toHaveClass("strike-wavy"),
    );
  });

  it("lets the admin scrap an item", async () => {
    const user = userEvent.setup();
    const todo = make({ title: "water the plants" });
    render(<TodoList canEdit initialTodos={[todo]} />);
    deleteTodo.mockResolvedValue(undefined);

    await user.click(screen.getByLabelText(/scrap "water the plants"/));

    expect(deleteTodo).toHaveBeenCalledWith(todo.id);
    expect(screen.queryByText("water the plants")).not.toBeInTheDocument();
  });

  it("lets the admin rename an item in place", async () => {
    const user = userEvent.setup();
    const todo = make({ title: "water the plants" });
    render(<TodoList canEdit initialTodos={[todo]} />);
    updateTodo.mockResolvedValue({ ...todo, title: "water the cactus" });

    await user.click(screen.getByText("water the plants"));
    const input = screen.getByLabelText('edit "water the plants"');
    await user.clear(input);
    await user.type(input, "water the cactus{Enter}");

    expect(updateTodo).toHaveBeenCalledWith(todo.id, { title: "water the cactus" });
    expect(await screen.findByText("water the cactus")).toBeInTheDocument();
  });

  it("escape abandons a rename", async () => {
    const user = userEvent.setup();
    const todo = make({ title: "water the plants" });
    render(<TodoList canEdit initialTodos={[todo]} />);

    await user.click(screen.getByText("water the plants"));
    await user.type(screen.getByLabelText('edit "water the plants"'), " and more{Escape}");

    expect(updateTodo).not.toHaveBeenCalled();
    expect(screen.getByText("water the plants")).toBeInTheDocument();
  });

  it("a blank rename closes the editor without saving", async () => {
    const user = userEvent.setup();
    const todo = make({ title: "water the plants" });
    render(<TodoList canEdit initialTodos={[todo]} />);

    await user.click(screen.getByText("water the plants"));
    await user.clear(screen.getByLabelText('edit "water the plants"'));
    await user.keyboard("{Enter}");

    expect(updateTodo).not.toHaveBeenCalled();
    expect(screen.getByText("water the plants")).toBeInTheDocument();
  });

  it("uncrossing moves an item back to the open list", async () => {
    const user = userEvent.setup();
    const todo = make({
      title: "learn the accordion",
      done: true,
      done_at: "2026-06-02T00:00:00Z",
    });
    render(<TodoList canEdit initialTodos={[todo]} />);
    updateTodo.mockResolvedValue({ ...todo, done: false, done_at: null });

    await user.click(screen.getByLabelText(/un-cross "learn the accordion"/));

    expect(updateTodo).toHaveBeenCalledWith(todo.id, { done: false });
    expect(screen.getByText("learn the accordion")).not.toHaveClass("strike-wavy");
    expect(screen.queryByRole("heading", { name: /crossed off/ })).not.toBeInTheDocument();
  });

  it("marks a todo that's scheduled on today's panel", () => {
    const todo = make({ title: "water the plants" });
    render(
      <TodoList
        canEdit={false}
        initialTodos={[todo, make({ title: "learn the accordion" })]}
        today="2026-06-12"
        todayEvents={[
          makeEvent({ title: "water the plants", start_time: "09:00:00", todo_id: todo.id }),
        ]}
      />,
    );

    /* exactly one marker, and the unscheduled row stays unmarked */
    expect(screen.getAllByTitle("scheduled today")).toHaveLength(1);
    const marked = screen.getByTitle("scheduled today").closest("li");
    expect(marked).toHaveTextContent("water the plants");
  });

  it("renders the day panel when today's date is passed", () => {
    render(
      <TodoList
        canEdit={false}
        initialTodos={[]}
        today="2026-06-12"
        todayEvents={[]}
      />,
    );

    expect(screen.getByRole("heading", { name: /today/ })).toBeInTheDocument();
    expect(screen.getByText(/nothing scheduled this day/)).toBeInTheDocument();
  });
});
