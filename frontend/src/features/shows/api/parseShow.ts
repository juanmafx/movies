import { IMAGE_ORIGIN } from "../../../shared/config/imageOrigin";
import { ApiError } from "../../../shared/http/ApiError";
import type { Show } from "../domain/show";

type JsonObject = Record<string, unknown>;

const isObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const optionalString = (value: unknown): string | null =>
  typeof value === "string" && value.length > 0 ? value : null;

function imageUrl(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  try {
    const url = new URL(value);
    return url.origin === IMAGE_ORIGIN && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

function toShow(value: unknown): Show | null {
  if (!isObject(value) || !Number.isSafeInteger(value.id) || (value.id as number) <= 0) {
    return null;
  }
  const name = optionalString(value.name);
  if (!name) {
    return null;
  }

  const image = isObject(value.image) ? value.image : {};
  const rating = isObject(value.rating) ? value.rating.average : null;
  const premiered = optionalString(value.premiered);

  return {
    id: value.id as number,
    name,
    summaryHtml: optionalString(value.summary),
    imageMediumUrl: imageUrl(image.medium),
    imageOriginalUrl: imageUrl(image.original),
    language: optionalString(value.language),
    genres: Array.isArray(value.genres)
      ? value.genres.filter((genre): genre is string => typeof genre === "string")
      : [],
    premiered: premiered && /^\d{4}-\d{2}-\d{2}$/.test(premiered) ? premiered : null,
    ratingAverage:
      typeof rating === "number" && Number.isFinite(rating) && rating >= 0 && rating <= 10
        ? rating
        : null,
  };
}

export function parseShow(payload: unknown): Show {
  const show = toShow(payload);
  if (!show) {
    throw new ApiError("invalid-response");
  }
  return show;
}

export function parseShowSearchResults(payload: unknown): Show[] {
  if (!Array.isArray(payload)) {
    throw new ApiError("invalid-response");
  }
  const showsById = new Map<number, Show>();
  for (const entry of payload) {
    const show = isObject(entry) ? toShow(entry.show) : null;
    if (show && !showsById.has(show.id)) {
      showsById.set(show.id, show);
    }
  }
  return [...showsById.values()];
}
