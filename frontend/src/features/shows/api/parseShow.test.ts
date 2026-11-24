import { describe, expect, it } from "vitest";
import { showPayload } from "../../../test/fixtures";
import { parseShow, parseShowSearchResults } from "./parseShow";

describe("parseShow", () => {
  it("maps the API payload to the domain model", () => {
    expect(parseShow(showPayload)).toEqual({
      id: 7,
      name: "Example Show",
      summaryHtml: "<p>A <b>safe</b> summary.</p>",
      imageMediumUrl: "https://static.tvmaze.com/medium.jpg",
      imageOriginalUrl: "https://static.tvmaze.com/original.jpg",
      language: "English",
      genres: ["Drama", "Comedy"],
      premiered: "2012-04-15",
      ratingAverage: 7.5,
    });
  });

  it("tolerates the null fields that crashed the original app", () => {
    const show = parseShow({ id: 1, name: "Sparse", image: null, summary: null, rating: null });
    expect(show).toMatchObject({
      imageMediumUrl: null,
      imageOriginalUrl: null,
      summaryHtml: null,
      ratingAverage: null,
      genres: [],
    });
  });

  it.each(["javascript:alert(1)", "data:image/svg+xml,x", "http://example.test/a.jpg", "::", 5])(
    "rejects the unsafe image URL %s",
    (medium) => {
      expect(parseShow({ ...showPayload, image: { medium } }).imageMediumUrl).toBeNull();
    },
  );

  it("discards out-of-range ratings and malformed dates", () => {
    const show = parseShow({ ...showPayload, rating: { average: 99 }, premiered: "soon" });
    expect(show.ratingAverage).toBeNull();
    expect(show.premiered).toBeNull();
  });

  it.each([null, [], "x", { id: "1", name: "a" }, { id: -1, name: "a" }, { id: 1 }])(
    "rejects %j",
    (payload) => {
      expect(() => parseShow(payload)).toThrow(expect.objectContaining({ kind: "invalid-response" }));
    },
  );
});

describe("parseShowSearchResults", () => {
  it("unwraps results, drops invalid entries and removes duplicates", () => {
    const shows = parseShowSearchResults([
      { score: 1, show: showPayload },
      { score: 0.9, show: showPayload },
      { score: 0.8, show: { id: "bad" } },
      null,
    ]);
    expect(shows.map((show) => show.id)).toEqual([7]);
  });

  it("rejects non-array payloads", () => {
    expect(() => parseShowSearchResults({})).toThrow(
      expect.objectContaining({ kind: "invalid-response" }),
    );
  });
});
