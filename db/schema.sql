-- Optional cache schema for TVmaze shows; the application does not use a database.
-- Verified on PostgreSQL 17 and on SQLite through sql.js.

CREATE TABLE IF NOT EXISTS shows (
    id                 INTEGER PRIMARY KEY CHECK (id > 0),
    name               TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 500),
    summary_html       TEXT CHECK (length(summary_html) <= 20000),
    image_medium_url   TEXT CHECK (image_medium_url LIKE 'https://%'),
    image_original_url TEXT CHECK (image_original_url LIKE 'https://%'),
    language           TEXT,
    premiered_on       DATE,
    rating_average     NUMERIC(3, 1) CHECK (rating_average BETWEEN 0 AND 10),
    fetched_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS genres (
    name TEXT PRIMARY KEY CHECK (length(name) BETWEEN 1 AND 100)
);

CREATE TABLE IF NOT EXISTS show_genres (
    show_id    INTEGER NOT NULL REFERENCES shows (id) ON DELETE CASCADE,
    genre_name TEXT    NOT NULL REFERENCES genres (name) ON DELETE CASCADE,
    PRIMARY KEY (show_id, genre_name)
);

CREATE TABLE IF NOT EXISTS search_results (
    query_text  TEXT      NOT NULL CHECK (length(query_text) BETWEEN 1 AND 100),
    show_id     INTEGER   NOT NULL REFERENCES shows (id) ON DELETE CASCADE,
    result_rank INTEGER   NOT NULL CHECK (result_rank > 0),
    fetched_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (query_text, show_id),
    UNIQUE (query_text, result_rank)
);

CREATE INDEX IF NOT EXISTS idx_show_genres_genre_name ON show_genres (genre_name);
CREATE INDEX IF NOT EXISTS idx_search_results_show_id ON search_results (show_id);
