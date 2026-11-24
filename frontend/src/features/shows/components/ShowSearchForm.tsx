import type { FormEvent } from "react";
import { MAX_SEARCH_QUERY_LENGTH } from "../domain/show";

type ShowSearchFormProps = {
  query: string;
  onSearch: (query: string) => void;
};

export function ShowSearchForm({ query, onSearch }: ShowSearchFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(String(new FormData(event.currentTarget).get("query") ?? ""));
  };

  return (
    <form className="search" role="search" onSubmit={handleSubmit}>
      <label htmlFor="show-search">Search shows</label>
      <input
        key={query}
        id="show-search"
        name="query"
        type="search"
        defaultValue={query}
        maxLength={MAX_SEARCH_QUERY_LENGTH}
        autoComplete="off"
      />
      <button type="submit" className="button">
        Search
      </button>
    </form>
  );
}
