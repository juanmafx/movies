export type ApiErrorKind =
  | "not-found"
  | "rate-limited"
  | "http"
  | "network"
  | "timeout"
  | "invalid-response";

const MESSAGES: Record<ApiErrorKind, string> = {
  "not-found": "We could not find that show.",
  "rate-limited": "Too many requests. Wait a few seconds and try again.",
  http: "The TV show service returned an error.",
  network: "The TV show service could not be reached.",
  timeout: "The TV show service took too long to respond.",
  "invalid-response": "The TV show service returned unexpected data.",
};

export class ApiError extends Error {
  readonly kind: ApiErrorKind;

  constructor(kind: ApiErrorKind) {
    super(MESSAGES[kind]);
    this.name = "ApiError";
    this.kind = kind;
  }
}

export function describeError(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong.";
}
