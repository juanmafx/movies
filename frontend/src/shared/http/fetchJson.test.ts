import { describe, expect, it, vi } from "vitest";
import { jsonResponse } from "../../test/fixtures";
import { ApiError, describeError } from "./ApiError";
import { fetchJson } from "./fetchJson";

const signal = () => new AbortController().signal;

const hangingFetch = () =>
  vi.fn(
    (_url: string, init: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init.signal?.addEventListener("abort", () =>
          reject(new DOMException("Aborted", "AbortError")),
        );
      }),
  );

describe("fetchJson", () => {
  it("returns parsed JSON and sends a hardened request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchJson("https://api.example.test/a", signal())).resolves.toEqual({ ok: true });

    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      method: "GET",
      credentials: "omit",
      redirect: "error",
      referrerPolicy: "no-referrer",
    });
  });

  it.each([
    [404, "not-found"],
    [429, "rate-limited"],
    [500, "http"],
  ])("maps HTTP %i to %s", async (status, kind) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, status)));
    await expect(fetchJson("https://x.test", signal())).rejects.toMatchObject({ kind });
  });

  it("reports malformed JSON", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>")));
    await expect(fetchJson("https://x.test", signal())).rejects.toMatchObject({
      kind: "invalid-response",
    });
  });

  it("reports network failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    await expect(fetchJson("https://x.test", signal())).rejects.toMatchObject({ kind: "network" });
  });

  it("reports timeouts", async () => {
    vi.stubGlobal("fetch", hangingFetch());
    await expect(fetchJson("https://x.test", signal(), 5)).rejects.toMatchObject({
      kind: "timeout",
    });
  });

  it("propagates caller aborts as AbortError", async () => {
    vi.stubGlobal("fetch", hangingFetch());
    const controller = new AbortController();
    const pending = fetchJson("https://x.test", controller.signal);
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  });

  it("never exposes unknown error details to the UI", () => {
    expect(describeError(new Error("secret internals"))).toBe("Something went wrong.");
    expect(describeError(new ApiError("timeout"))).toMatch(/too long/);
  });
});
