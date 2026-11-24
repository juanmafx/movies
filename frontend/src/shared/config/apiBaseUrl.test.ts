import { describe, expect, it } from "vitest";
import { DEFAULT_API_BASE_URL, resolveApiBaseUrl } from "./apiBaseUrl";

describe("resolveApiBaseUrl", () => {
  it.each([undefined, "", "   "])("falls back to the default for %j", (value) => {
    expect(resolveApiBaseUrl(value)).toBe(DEFAULT_API_BASE_URL);
  });

  it("strips trailing slashes", () => {
    expect(resolveApiBaseUrl("https://api.example.test/v1//")).toBe("https://api.example.test/v1");
  });

  it("allows plain HTTP on loopback only", () => {
    expect(resolveApiBaseUrl("http://localhost:8080")).toBe("http://localhost:8080");
    expect(() => resolveApiBaseUrl("http://api.example.test")).toThrow(/HTTPS/);
  });

  it.each([
    "javascript:alert(1)",
    "https://user:pass@api.example.test",
    "https://api.example.test?x=1",
    "https://api.example.test#fragment",
    "not a url",
  ])("rejects %s", (value) => {
    expect(() => resolveApiBaseUrl(value)).toThrow();
  });
});
