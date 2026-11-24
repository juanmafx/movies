import { useCallback } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { StatusMessage } from "../../../shared/components/StatusMessage";
import { useAsyncResource } from "../../../shared/hooks/useAsyncResource";
import { ApiError, describeError } from "../../../shared/http/ApiError";
import { RichText } from "../../../shared/richText/RichText";
import { showsClient } from "../api/showsClient";
import { ShowPoster } from "../components/ShowPoster";
import { normalizeSearchQuery, parseShowId, type Show } from "../domain/show";

export function ShowDetailPage() {
  const { showId } = useParams();
  const [searchParams] = useSearchParams();
  const id = parseShowId(showId);
  const rawQuery = searchParams.get("q");
  const backSearch = rawQuery ? `?${new URLSearchParams({ q: normalizeSearchQuery(rawQuery) })}` : "";
  const load = useCallback(
    (signal: AbortSignal) =>
      id === null ? Promise.reject(new ApiError("not-found")) : showsClient.getShow(id, signal),
    [id],
  );
  const resource = useAsyncResource(load);
  const isRetryable = !(resource.status === "error" && isNotFound(resource.error));

  return (
    <section className="show-detail">
      <Link to={{ pathname: "/", search: backSearch }} className="button">
        Back
      </Link>
      {resource.status === "loading" ? (
        <StatusMessage tone="info">Loading show...</StatusMessage>
      ) : null}
      {resource.status === "error" ? (
        <StatusMessage tone="error" {...(isRetryable ? { onRetry: resource.retry } : {})}>
          {describeError(resource.error)}
        </StatusMessage>
      ) : null}
      {resource.status === "success" ? <ShowDetails show={resource.data} /> : null}
    </section>
  );
}

function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.kind === "not-found";
}

function ShowDetails({ show }: { show: Show }) {
  const facts = [
    show.premiered ? `Premiered ${show.premiered}` : null,
    show.language,
    show.genres.length > 0 ? show.genres.join(", ") : null,
    show.ratingAverage === null ? null : `Rated ${show.ratingAverage} / 10`,
  ].filter((fact): fact is string => fact !== null);

  return (
    <article>
      <title>{`${show.name} - Movies`}</title>
      <h1 className="page-title">{show.name}</h1>
      <div className="show-detail__body">
        <ShowPoster
          url={show.imageOriginalUrl ?? show.imageMediumUrl}
          name={show.name}
          width={400}
          height={600}
        />
        {facts.length > 0 ? (
          <ul className="show-detail__facts">
            {facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        ) : null}
        <RichText markup={show.summaryHtml} className="show-detail__summary" />
      </div>
    </article>
  );
}
