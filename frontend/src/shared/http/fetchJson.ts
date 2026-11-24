import { ApiError } from "./ApiError";

export const REQUEST_TIMEOUT_MS = 10_000;
export const MAX_RESPONSE_BYTES = 2_000_000;

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
  const body = await readBoundedText(response);
  try {
    return JSON.parse(body);
  } catch {
    throw new ApiError("invalid-response");
  }
}

async function readBoundedText(response: Response): Promise<string> {
  if (Number(response.headers.get("content-length")) > MAX_RESPONSE_BYTES) {
    throw new ApiError("invalid-response");
  }
  const reader = response.body?.getReader();
  if (!reader) {
    return "";
  }

  const decoder = new TextDecoder();
  let receivedBytes = 0;
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      return text + decoder.decode();
    }
    receivedBytes += value.byteLength;
    if (receivedBytes > MAX_RESPONSE_BYTES) {
      await reader.cancel().catch(() => undefined);
      throw new ApiError("invalid-response");
    }
    text += decoder.decode(value, { stream: true });
  }
}

function kindForStatus(status: number): "not-found" | "rate-limited" | "http" {
  if (status === 404) {
    return "not-found";
  }
  return status === 429 ? "rate-limited" : "http";
}
