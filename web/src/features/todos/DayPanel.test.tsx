// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { CalEvent } from "@/features/calendar/api";

const { createEvent, updateEvent, deleteEvent, getNotes, saveNote, refresh } =
  vi.hoisted(() => ({
    createEvent: vi.fn(),
    updateEvent: vi.fn(),
    deleteEvent: vi.fn(),
    getNotes: vi.fn(() => Promise.resolve([])),
    saveNote: vi.fn(),
    refresh: vi.fn(),
  }));

/* deleteEvent/getNotes serve EventCard and NoteLine, which the panel mounts */
vi.mock("@/features/calendar/api", () => ({
  createEvent,
  updateEvent,
  deleteEvent,
  getNotes,
  saveNote,
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

import DayPanel from "./DayPanel";

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

describe("DayPanel", () => {
  it("renders a timed event with its formatted time range", () => {
    render(
      <DayPanel
        today="2026-06-12"
        canEdit={false}
        events={[
          makeEvent({ title: "standup", start_time: "09:00:00", end_time: "10:30:00" }),
        ]}
      />,
    );

    expect(screen.getByText("standup")).toBeInTheDocument();
    expect(screen.getByText(/9:00am – 10:30am/)).toBeInTheDocument();
  });

  it("puts an event without a start time in the all-day section", () => {
    render(
      <DayPanel
        today="2026-06-12"
        canEdit={false}
        events={[
          makeEvent({ title: "ship day" }),
          makeEvent({ title: "standup", start_time: "09:00:00" }),
        ]}
      />,
    );

    const allDay = screen.getByLabelText("all day");
    expect(within(allDay).getByText("ship day")).toBeInTheDocument();
    expect(within(allDay).queryByText("standup")).not.toBeInTheDocument();
  });

  it("shows the right empty note for visitors and for the admin", () => {
    const { unmount } = render(
      <DayPanel today="2026-06-12" canEdit={false} events={[]} />,
    );
    expect(screen.getByText(/nothing scheduled this day/)).toBeInTheDocument();
    unmount();

    render(<DayPanel today="2026-06-12" canEdit events={[]} />);
    expect(screen.getByText(/drag a to-do in/)).toBeInTheDocument();
  });

  it("creates a one-hour event when a todo is dropped on a slot", async () => {
    createEvent.mockResolvedValue(makeEvent({ title: "water the plants" }));
    render(<DayPanel today="2026-06-12" canEdit events={[]} />);

    /* jsdom rects are all zero, so clientY is the offset from the grid top:
       the grid runs from midnight, so 432px = 9 hours = a 9:00am slot.
       jsdom has no DragEvent and drops clientY from fireEvent's init, so
       build the event by hand. */
    const drop = new Event("drop", { bubbles: true, cancelable: true });
    Object.assign(drop, {
      clientY: 432,
      dataTransfer: {
        getData: () => JSON.stringify({ id: "todo-1", title: "water the plants" }),
      },
    });
    fireEvent(screen.getByTestId("day-timeline"), drop);

    await waitFor(() =>
      expect(createEvent).toHaveBeenCalledWith({
        date: "2026-06-12",
        title: "water the plants",
        color: "forest",
        start_time: "09:00:00",
        end_time: "10:00:00",
        todo_id: "todo-1",
      }),
    );
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });

  it("creates an all-day event when a todo is dropped on the shelf", async () => {
    createEvent.mockResolvedValue(makeEvent({ title: "water the plants" }));
    render(<DayPanel today="2026-06-12" canEdit events={[]} />);

    const drop = new Event("drop", { bubbles: true, cancelable: true });
    Object.assign(drop, {
      dataTransfer: {
        getData: () => JSON.stringify({ id: "todo-1", title: "water the plants" }),
      },
    });
    fireEvent(screen.getByLabelText("all day"), drop);

    await waitFor(() =>
      expect(createEvent).toHaveBeenCalledWith({
        date: "2026-06-12",
        title: "water the plants",
        color: "forest",
        todo_id: "todo-1",
      }),
    );
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });

  it("moves an event with a complete PUT payload when its block is dragged", async () => {
    const ev = makeEvent({
      id: "ev-move",
      title: "standup",
      start_time: "09:00:00",
      end_time: "10:00:00",
      recur: "daily",
      series_date: "2026-06-01",
      todo_id: "todo-1",
    });
    updateEvent.mockResolvedValue(ev);
    render(<DayPanel today="2026-06-12" canEdit events={[ev]} />);

    const block = screen.getByText("standup").closest("div")!;
    /* 48px down = one hour later */
    fireEvent.pointerDown(block, { clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(block, { clientY: 148, pointerId: 1 });
    fireEvent.pointerUp(block, { clientY: 148, pointerId: 1 });

    await waitFor(() =>
      expect(updateEvent).toHaveBeenCalledWith("ev-move", {
        date: "2026-06-01" /* the series row's date, not today's occurrence */,
        title: "standup",
        note: "",
        color: "forest",
        start_time: "10:00:00",
        end_time: "11:00:00",
        end_date: null,
        recur: "daily",
        todo_id: "todo-1",
      }),
    );
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });

  it("treats a sub-4px wiggle as a click and opens the event modal", () => {
    const ev = makeEvent({ id: "ev-still", title: "standup", start_time: "09:00:00" });
    render(<DayPanel today="2026-06-12" canEdit events={[ev]} />);

    const block = screen.getByText("standup").closest("div")!;
    fireEvent.pointerDown(block, { clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(block, { clientY: 102, pointerId: 1 });
    fireEvent.pointerUp(block, { clientY: 102, pointerId: 1 });

    expect(updateEvent).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("lays overlapping events out side by side with separate lanes", () => {
    render(
      <DayPanel
        today="2026-06-12"
        canEdit={false}
        events={[
          makeEvent({ id: "ev-a", title: "deep work", start_time: "09:00:00", end_time: "12:00:00" }),
          makeEvent({ id: "ev-b", title: "standup", start_time: "10:00:00", end_time: "11:00:00" }),
        ]}
      />,
    );

    const a = screen.getByText("deep work").closest("div")!;
    const b = screen.getByText("standup").closest("div")!;
    /* both squeeze to half width (jsdom normalizes `x / 2` to `0.5 * x`),
       in different lanes */
    expect(a.style.width).toContain("0.5");
    expect(a.style.width).toBe(b.style.width);
    expect(a.style.left).not.toBe(b.style.left);
  });
});
