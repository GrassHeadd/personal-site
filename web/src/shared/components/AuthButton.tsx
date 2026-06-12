"use client";
import { useEffect, useRef, useState } from "react";

type State = "checking" | "out" | "asking" | "in";

const AuthButton = () => {
  const [state, setState] = useState<State>("checking");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [wrong, setWrong] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setState(d.admin ? "in" : "out"))
      .catch(() => setState("out"));
  }, []);

  useEffect(() => {
    if (state === "asking") inputRef.current?.focus();
  }, [state]);

  /* invisible placeholder keeps the nav links from shifting once the
     real button appears after the session check */
  if (state === "checking") {
    return (
      <span aria-hidden className="hand text-sm md:text-base invisible">
        sign in
      </span>
    );
  }

  if (state === "asking") {
    const submit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!password || busy) return;
      setBusy(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      }).catch(() => null);
      setBusy(false);
      if (res?.ok) {
        /* reload so every component re-checks the session */
        window.location.reload();
      } else {
        setWrong(true);
        setPassword("");
        inputRef.current?.focus();
      }
    };
    return (
      <form onSubmit={submit} className="inline-flex items-baseline gap-2">
        <input
          ref={inputRef}
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setWrong(false);
          }}
          onKeyDown={(e) => e.key === "Escape" && setState("out")}
          placeholder={wrong ? "nope, again?" : "magic word?"}
          aria-label="admin password"
          className={`hand w-28 px-2 bg-paper sketch-border-soft text-sm placeholder:text-ink-soft/60 focus:outline-none ${
            wrong ? "!border-amber" : "focus:border-forest"
          }`}
        />
        <button
          type="submit"
          disabled={busy || !password}
          className="hand text-sm quiet-link cursor-pointer disabled:opacity-50"
        >
          {busy ? "..." : "go"}
        </button>
      </form>
    );
  }

  const handleClick = async () => {
    if (state === "in") {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
      window.location.reload();
    } else {
      setState("asking");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="hand text-sm md:text-base quiet-link cursor-pointer"
    >
      {state === "in" ? "sign out" : "sign in"}
    </button>
  );
};

export default AuthButton;
