import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { authorized, sb } from "./db";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(Response.json([]));
  vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-key");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("sb", () => {
  it("hits PostgREST with auth headers and no caching", async () => {
    await sb("todos?order=created_at.asc");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://example.supabase.co/rest/v1/todos?order=created_at.asc");
    expect(init.cache).toBe("no-store");
    expect(init.headers).toMatchObject({
      apikey: "service-key",
      Authorization: "Bearer service-key",
      "Content-Type": "application/json",
      Prefer: "return=representation",
    });
  });

  it("prefers the service role key over the publishable key", async () => {
    vi.stubEnv("SUPABASE_KEY", "publishable-key");

    await sb("todos");
    expect(fetchMock.mock.calls[0][1].headers.apikey).toBe("service-key");
  });

  it("falls back to the publishable key", async () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    vi.stubEnv("SUPABASE_KEY", "publishable-key");

    await sb("todos");
    expect(fetchMock.mock.calls[0][1].headers.apikey).toBe("publishable-key");
  });

  it("throws when not configured", async () => {
    vi.stubEnv("SUPABASE_URL", "");
    await expect(sb("todos")).rejects.toThrow(/not configured/);
  });
});

describe("authorized", () => {
  it("accepts the configured API key header", () => {
    vi.stubEnv("BLOG_API_KEY", "k");
    expect(
      authorized(new Request("http://t", { headers: { "X-API-Key": "k" } })),
    ).toBe(true);
  });

  it("rejects missing or wrong keys", () => {
    vi.stubEnv("BLOG_API_KEY", "k");
    expect(authorized(new Request("http://t"))).toBe(false);
    expect(
      authorized(new Request("http://t", { headers: { "X-API-Key": "wrong" } })),
    ).toBe(false);
  });

  it("rejects everything when no key is configured", () => {
    vi.stubEnv("BLOG_API_KEY", "");
    expect(
      authorized(new Request("http://t", { headers: { "X-API-Key": "" } })),
    ).toBe(false);
  });
});
