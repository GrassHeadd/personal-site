// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock("@emailjs/browser", () => ({ default: { send } }));

import ContactForm, { toTemplateParams } from "./ContactForm";

const fillAndSubmit = async () => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/your name/), "Ada Lovelace");
  await user.type(screen.getByLabelText(/your email/), "ada@example.com");
  await user.type(screen.getByLabelText(/your message/), "hello there");
  await user.click(screen.getByRole("button", { name: /send it/ }));
  return user;
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_EMAILJS_SERVICE_ID", "service_test");
  vi.stubEnv("NEXT_PUBLIC_EMAILJS_TEMPLATE_ID", "template_test");
  vi.stubEnv("NEXT_PUBLIC_EMAILJS_PUBLIC_KEY", "public_test");
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("toTemplateParams", () => {
  it("exposes the sender's email under every common template variable", () => {
    const params = toTemplateParams({
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "hello there",
    });

    expect(params.email).toBe("ada@example.com");
    expect(params.from_email).toBe("ada@example.com");
    expect(params.reply_to).toBe("ada@example.com");
    expect(params.name).toBe("Ada Lovelace");
    expect(params.from_name).toBe("Ada Lovelace");
    expect(params.message).toBe("hello there");
  });
});

describe("ContactForm", () => {
  it("sends the typed values, including the sender's email", async () => {
    send.mockResolvedValue({ status: 200, text: "OK" });
    render(<ContactForm />);

    await fillAndSubmit();

    await waitFor(() => expect(send).toHaveBeenCalledTimes(1));
    expect(send).toHaveBeenCalledWith(
      "service_test",
      "template_test",
      expect.objectContaining({
        email: "ada@example.com",
        from_email: "ada@example.com",
        reply_to: "ada@example.com",
        from_name: "Ada Lovelace",
        message: "hello there",
      }),
      "public_test",
    );
  });

  it("confirms success and clears the form", async () => {
    send.mockResolvedValue({ status: 200, text: "OK" });
    render(<ContactForm />);

    await fillAndSubmit();

    expect(await screen.findByRole("status")).toHaveTextContent(
      "got it, talk soon!",
    );
    expect(screen.getByLabelText(/your email/)).toHaveValue("");
    expect(screen.getByLabelText(/your message/)).toHaveValue("");
  });

  it("shows the error note and keeps what was typed when sending fails", async () => {
    send.mockRejectedValue(new Error("emailjs down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<ContactForm />);

    await fillAndSubmit();

    expect(await screen.findByRole("alert")).toHaveTextContent(/didn't send/);
    expect(screen.getByLabelText(/your email/)).toHaveValue("ada@example.com");
  });
});
