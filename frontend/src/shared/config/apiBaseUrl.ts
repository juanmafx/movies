export const DEFAULT_API_BASE_URL = "https://api.tvmaze.com";

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);
const SAFE_HOSTNAME = /^(?:[a-z0-9-]+(?:\.[a-z0-9-]+)*|\[[0-9a-f:.]+\])$/;

export function resolveApiBaseUrl(rawValue: string | undefined): string {
  const candidate = rawValue?.trim();
  if (!candidate) {
    return DEFAULT_API_BASE_URL;
  }

  const url = parseUrl(candidate);
  const isSecure =
    url.protocol === "https:" || (url.protocol === "http:" && LOOPBACK_HOSTS.has(url.hostname));

  if (
    !isSecure ||
    !SAFE_HOSTNAME.test(url.hostname) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "VITE_TVMAZE_API_URL must be an HTTPS URL with a plain hostname and no credentials, query or fragment",
    );
  }

  return `${url.origin}${url.pathname.replace(/\/+$/, "")}`;
}

function parseUrl(value: string): URL {
  try {
    return new URL(value);
  } catch {
    throw new Error("VITE_TVMAZE_API_URL is not a valid URL");
  }
}
