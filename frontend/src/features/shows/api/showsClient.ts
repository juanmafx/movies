import { resolveApiBaseUrl } from "../../../shared/config/apiBaseUrl";
import { fetchJson } from "../../../shared/http/fetchJson";
import type { Show } from "../domain/show";
import { parseShow, parseShowSearchResults } from "./parseShow";

export type ShowsClient = {
  searchShows: (query: string, signal: AbortSignal) => Promise<Show[]>;
  getShow: (id: number, signal: AbortSignal) => Promise<Show>;
};

export function createShowsClient(baseUrl: string): ShowsClient {
  return {
    async searchShows(query, signal) {
      const params = new URLSearchParams({ q: query });
      return parseShowSearchResults(await fetchJson(`${baseUrl}/search/shows?${params}`, signal));
    },
    async getShow(id, signal) {
      return parseShow(await fetchJson(`${baseUrl}/shows/${id}`, signal));
    },
  };
}

export const showsClient = createShowsClient(
  resolveApiBaseUrl(import.meta.env.VITE_TVMAZE_API_URL),
);
