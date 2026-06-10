"use client";
import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";

type Status = "idle" | "sending" | "sent" | "error";

const fieldClasses =
  "w-full px-4 py-3 bg-paper sketch-border-soft text-ink placeholder:text-ink-soft/60 focus:outline-none focus:border-forest transition-colors";

const ContactForm = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");

    try {
      await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        formRef.current!,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!,
      );
      setForm({ name: "", email: "", message: "" });
      setStatus("sent");
    } catch (error) {
      console.error("EmailJS Error:", error);
      setStatus("error");
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 mt-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="hand text-sm text-ink-soft">your name</span>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="who's this?"
            required
            className={fieldClasses}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="hand text-sm text-ink-soft">your email</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="so i can write back"
            required
            className={fieldClasses}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="hand text-sm text-ink-soft">your message</span>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="say anything"
          rows={4}
          required
          className={fieldClasses}
        />
      </label>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={status === "sending"}
          className="hand sketch-border px-6 py-2.5 font-bold bg-forest text-paper border-forest hover:-rotate-1 hover:bg-ink hover:border-ink transition-all duration-200 disabled:opacity-60 disabled:hover:rotate-0 cursor-pointer"
        >
          {status === "sending" ? "sending..." : "send it ✉️"}
        </button>
        {status === "sent" && (
          <p className="hand text-forest" role="status">
            got it, talk soon!
          </p>
        )}
        {status === "error" && (
          <p className="hand text-amber" role="alert">
            hmm, that didn&apos;t send. try again or find me below.
          </p>
        )}
      </div>
    </form>
  );
};

export default ContactForm;
