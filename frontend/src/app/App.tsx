import { Link, Route, Routes } from "react-router";
import { ShowDetailPage } from "../features/shows/pages/ShowDetailPage";
import { ShowListPage } from "../features/shows/pages/ShowListPage";
import { StatusMessage } from "../shared/components/StatusMessage";

export function App() {
  return (
    <div className="app">
      <header className="app__header">
        <Link to="/" className="app__brand">
          Movies
        </Link>
      </header>
      <main className="app__main">
        <Routes>
          <Route index element={<ShowListPage />} />
          <Route path="shows/:showId" element={<ShowDetailPage />} />
          <Route path="*" element={<StatusMessage tone="error">Page not found.</StatusMessage>} />
        </Routes>
      </main>
      <footer className="app__footer">
        Data provided by{" "}
        <a href="https://www.tvmaze.com/api" target="_blank" rel="noopener noreferrer">
          TVmaze
        </a>{" "}
        under{" "}
        <a
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          target="_blank"
          rel="noopener noreferrer"
        >
          CC BY-SA
        </a>
        .
      </footer>
    </div>
  );
}
