import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { StatusMessage } from "../../../shared/components/StatusMessage";
import { useAsyncResource } from "../../../shared/hooks/useAsyncResource";
import { describeError } from "../../../shared/http/ApiError";
import { showsClient } from "../api/showsClient";
import { ShowCard } from "../components/ShowCard";
import { ShowSearchForm } from "../components/ShowSearchForm";
import { normalizeSearchQuery } from "../domain/show";

export function ShowListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = normalizeSearchQuery(searchParams.get("q"));
  const load = useCallback(
    (signal: AbortSignal) => showsClient.searchShows(query, signal),
    [query],
  );
  const resource = useAsyncResource(load);
  const detailSearch = `?${new URLSearchParams({ q: query })}`;

  return (
    <section>
      <title>{`${query} - Movies`}</title>
      <h1 className="page-title">Movies</h1>
      <ShowSearchForm
        query={query}
        onSearch={(nextQuery) => setSearchParams({ q: normalizeSearchQuery(nextQuery) })}
      />
      {resource.status === "loading" ? (
        <StatusMessage tone="info">Loading shows...</StatusMessage>
      ) : null}
      {resource.status === "error" ? (
        <StatusMessage tone="error" onRetry={resource.retry}>
          {describeError(resource.error)}
        </StatusMessage>
      ) : null}
      {resource.status === "success" && resource.data.length === 0 ? (
        <StatusMessage tone="info">No shows found.</StatusMessage>
      ) : null}
      {resource.status === "success" && resource.data.length > 0 ? (
        <div className="show-grid">
          {resource.data.map((show) => (
            <ShowCard key={show.id} show={show} detailSearch={detailSearch} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
