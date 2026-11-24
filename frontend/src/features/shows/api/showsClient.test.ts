import { describe, expect, it, vi } from "vitest";
import { jsonResponse, showPayload } from "../../../test/fixtures";
import { createShowsClient } from "./showsClient";

const signal = new AbortController().signal;

describe("createShowsClient", () => {
  it("encodes search queries", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([{ show: showPayload }]));
    vi.stubGlobal("fetch", fetchMock);

    const shows = await createShowsClient("https://api.test").searchShows("a&b=c d/#", signal);

    expect(shows).toHaveLength(1);
    const requested = new URL(fetchMock.mock.calls[0]?.[0] as string);
    expect(requested.pathname).toBe("/search/shows");
    expect([...requested.searchParams.keys()]).toEqual(["q"]);
    expect(requested.searchParams.get("q")).toBe("a&b=c d/#");
  });

  it("requests a show by id", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(showPayload));
    vi.stubGlobal("fetch", fetchMock);

    const show = await createShowsClient("https://api.test").getShow(7, signal);

    expect(show.name).toBe("Example Show");
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://api.test/shows/7");
  });
});
