import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { jsonResponse, showPayload } from "../test/fixtures";
import { App } from "./App";

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );

const requestedUrl = (fetchMock: ReturnType<typeof vi.fn>, call = 0) =>
  new URL(fetchMock.mock.calls[call]?.[0] as string);

describe("show list", () => {
  it("loads the default search and renders cards", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([{ score: 1, show: showPayload }]));
    vi.stubGlobal("fetch", fetchMock);
    renderAt("/");

    expect(screen.getByText("Loading shows...")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Example Show" })).toBeInTheDocument();
    expect(requestedUrl(fetchMock).searchParams.get("q")).toBe("girls");
    expect(screen.getByRole("link", { name: /Example Show/ })).toHaveAttribute(
      "href",
      "/shows/7?q=girls",
    );
  });

  it("renders a show without image or summary", async () => {
    const sparse = { id: 9, name: "Sparse", image: null, summary: null };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse([{ show: sparse }])));
    renderAt("/");

    expect(await screen.findByRole("img", { name: "No poster for Sparse" })).toBeInTheDocument();
  });

  it("does not execute markup from the API", async () => {
    const hostile = { ...showPayload, summary: "<img src=x onerror=alert(1)><p>Clean</p>" };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse([{ show: hostile }])));
    const { container } = renderAt("/");

    expect(await screen.findByText("Clean")).toBeInTheDocument();
    expect(container.querySelector("[onerror]")).toBeNull();
  });

  it("searches and updates the request", async () => {
    const fetchMock = vi.fn().mockImplementation(async () => jsonResponse([]));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderAt("/?q=first");

    expect(await screen.findByText("No shows found.")).toBeInTheDocument();
    const input = screen.getByLabelText("Search shows");
    await user.clear(input);
    await user.type(input, "second query{Enter}");

    await waitFor(() =>
      expect(requestedUrl(fetchMock, fetchMock.mock.calls.length - 1).searchParams.get("q")).toBe(
        "second query",
      ),
    );
  });

  it("shows an error and recovers on retry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({}, 429))
      .mockResolvedValueOnce(jsonResponse([{ show: showPayload }]));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderAt("/");

    expect(await screen.findByRole("alert")).toHaveTextContent("Too many requests");
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("heading", { name: "Example Show" })).toBeInTheDocument();
  });

  it("aborts the in-flight request on unmount", async () => {
    let capturedSignal: AbortSignal | null | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init: RequestInit) => {
        capturedSignal = init.signal;
        return new Promise<Response>(() => undefined);
      }),
    );
    const { unmount } = renderAt("/");
    await waitFor(() => expect(capturedSignal).toBeTruthy());

    unmount();

    expect(capturedSignal?.aborted).toBe(true);
  });
});

describe("show detail", () => {
  it("loads one show and links back to the search", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(showPayload));
    vi.stubGlobal("fetch", fetchMock);
    renderAt("/shows/7?q=drama");

    expect(await screen.findByRole("heading", { name: "Example Show" })).toBeInTheDocument();
    expect(requestedUrl(fetchMock).pathname).toBe("/shows/7");
    expect(screen.getByText("Rated 7.5 / 10")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back" })).toHaveAttribute("href", "/?q=drama");
  });

  it("does not call the API for an invalid id", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    renderAt("/shows/abc");

    expect(await screen.findByRole("alert")).toHaveTextContent("could not find");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  });

  it("offers retry for transient failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, 503)));
    renderAt("/shows/7");

    expect(await screen.findByRole("alert")).toHaveTextContent("returned an error");
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
});

describe("application shell", () => {
  it("renders a not-found page for unknown routes", () => {
    vi.stubGlobal("fetch", vi.fn());
    renderAt("/unknown/path");
    expect(screen.getByRole("alert")).toHaveTextContent("Page not found.");
  });

  it("credits TVmaze with safe external links", () => {
    vi.stubGlobal("fetch", vi.fn());
    renderAt("/unknown/path");
    expect(screen.getByRole("link", { name: "TVmaze" })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
    expect(screen.getByRole("link", { name: "CC BY-SA" })).toBeInTheDocument();
  });
});
