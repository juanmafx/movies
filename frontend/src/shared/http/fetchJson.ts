import { ApiError } from "./ApiError";

export const REQUEST_TIMEOUT_MS = 10_000;

export async function fetchJson(
  url: string,
  signal: AbortSignal,
  timeoutMs: number = REQUEST_TIMEOUT_MS,
): Promise<unknown> {
  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(), timeoutMs);
  const forwardAbort = () => timeoutController.abort();
  signal.addEventListener("abort", forwardAbort, { once: true });

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "omit",
      redirect: "error",
      referrerPolicy: "no-referrer",
      signal: timeoutController.signal,
    });

    if (!response.ok) {
      throw new ApiError(kindForStatus(response.status));
    }

    return await readJson(response);
  } catch (error) {
    if (signal.aborted) {
      throw new DOMException("Request aborted", "AbortError");
    }
    if (timeoutController.signal.aborted) {
      throw new ApiError("timeout");
    }
    throw error instanceof ApiError ? error : new ApiError("network");
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", forwardAbort);
  }
}

async function readJson(response: Response): Promise<unknown> {
  const body = await response.text();
  try {
    return JSON.parse(body);
  } catch {
    throw new ApiError("invalid-response");
  }
}

function kindForStatus(status: number): "not-found" | "rate-limited" | "http" {
  if (status === 404) {
    return "not-found";
  }
  return status === 429 ? "rate-limited" : "http";
}
