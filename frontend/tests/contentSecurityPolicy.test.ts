import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy } from "../build/contentSecurityPolicy";

describe("buildContentSecurityPolicy", () => {
  const policy = buildContentSecurityPolicy("https://api.tvmaze.com");

  it("denies by default and scopes network access", () => {
    expect(policy).toContain("default-src 'none'");
    expect(policy).toContain("connect-src https://api.tvmaze.com");
    expect(policy).toContain("base-uri 'none'");
  });

  it("never allows inline or evaluated code", () => {
    expect(policy).not.toContain("unsafe-inline");
    expect(policy).not.toContain("unsafe-eval");
  });
});
