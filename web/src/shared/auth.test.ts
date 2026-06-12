import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/* in-memory stand-in for next/headers' request-scoped cookie jar */
const { jar } = vi.hoisted(() => ({ jar: new Map<string, string>() }));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      jar.has(name) ? { name, value: jar.get(name)! } : undefined,
    set: (name: string, value: string) => void jar.set(name, value),
    delete: (name: string) => void jar.delete(name),
  }),
}));

import { checkPassword, createSession, destroySession, isAdmin } from "./auth";

const SECRET = "test-secret";

const forgeToken = (expires: number, secret = SECRET) => {
  const payload = String(expires);
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
};

beforeEach(() => {
  jar.clear();
  vi.stubEnv("AUTH_SECRET", SECRET);
  vi.stubEnv("ADMIN_PASSWORD", "hunter2");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("checkPassword", () => {
  it("accepts the configured password", () => {
    expect(checkPassword("hunter2")).toBe(true);
  });

  it("rejects a wrong password", () => {
    expect(checkPassword("hunter3")).toBe(false);
    expect(checkPassword("")).toBe(false);
  });

  it("rejects everything when no password is configured", () => {
    vi.stubEnv("ADMIN_PASSWORD", "");
    expect(checkPassword("hunter2")).toBe(false);
    expect(checkPassword("")).toBe(false);
  });
});

describe("sessions", () => {
  it("createSession then isAdmin round-trips", async () => {
    await createSession();
    expect(await isAdmin()).toBe(true);
  });

  it("destroySession signs out", async () => {
    await createSession();
    await destroySession();
    expect(await isAdmin()).toBe(false);
  });

  it("is false with no cookie at all", async () => {
    expect(await isAdmin()).toBe(false);
  });

  it("rejects an expired session even with a valid signature", async () => {
    jar.set("admin_session", forgeToken(Date.now() - 1000));
    expect(await isAdmin()).toBe(false);
  });

  it("rejects a token signed with the wrong secret", async () => {
    jar.set("admin_session", forgeToken(Date.now() + 60_000, "other-secret"));
    expect(await isAdmin()).toBe(false);
  });

  it("rejects a token whose expiry was tampered with", async () => {
    const valid = forgeToken(Date.now() + 60_000);
    const sig = valid.slice(valid.lastIndexOf(".") + 1);
    jar.set("admin_session", `${Date.now() + 999_999_999}.${sig}`);
    expect(await isAdmin()).toBe(false);
  });

  it("rejects garbage tokens", async () => {
    for (const garbage of ["", "no-dot", ".sig-only", "a.b.c"]) {
      jar.set("admin_session", garbage);
      expect(await isAdmin()).toBe(false);
    }
  });
});
