export type Show = {
  id: number;
  name: string;
  summaryHtml: string | null;
  imageMediumUrl: string | null;
  imageOriginalUrl: string | null;
  language: string | null;
  genres: string[];
  premiered: string | null;
  ratingAverage: number | null;
};

export const DEFAULT_SEARCH_QUERY = "girls";
export const MAX_SEARCH_QUERY_LENGTH = 100;

export function normalizeSearchQuery(rawQuery: string | null): string {
  const query = (rawQuery ?? "").trim().replace(/\s+/g, " ").slice(0, MAX_SEARCH_QUERY_LENGTH).trim();
  return query || DEFAULT_SEARCH_QUERY;
}

export function parseShowId(rawId: string | undefined): number | null {
  if (!rawId || !/^[1-9]\d{0,14}$/.test(rawId)) {
    return null;
  }
  return Number(rawId);
}
