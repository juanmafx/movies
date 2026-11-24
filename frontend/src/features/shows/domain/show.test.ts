import { describe, expect, it } from "vitest";
import {
  DEFAULT_SEARCH_QUERY,
  MAX_SEARCH_QUERY_LENGTH,
  normalizeSearchQuery,
  parseShowId,
} from "./show";

describe("normalizeSearchQuery", () => {
  it.each([null, "", "   "])("uses the default for %j", (value) => {
    expect(normalizeSearchQuery(value)).toBe(DEFAULT_SEARCH_QUERY);
  });

  it("collapses whitespace", () => {
    expect(normalizeSearchQuery("  breaking \n  bad ")).toBe("breaking bad");
  });

  it("caps the length", () => {
    expect(normalizeSearchQuery("a".repeat(500))).toHaveLength(MAX_SEARCH_QUERY_LENGTH);
  });
});

describe("parseShowId", () => {
  it("accepts positive integers", () => {
    expect(parseShowId("139")).toBe(139);
  });

  it.each([undefined, "", "0", "-1", "1.5", "1e3", "abc", "1/../2", "9".repeat(16)])(
    "rejects %j",
    (value) => {
      expect(parseShowId(value)).toBeNull();
    },
  );
});
