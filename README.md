# Movies

A small React single-page application for searching TV shows and reading their details, powered by the public [TVmaze API](https://www.tvmaze.com/api).

> **Project history:** originally created in 2020, modernized in 2026.

## Purpose

Movies answers one question quickly: *which shows match this title, and what are they about?* Despite the repository name, the data source catalogs **TV shows**, not films.

## Why this project exists

It began in 2020 as a Create React App project that listed shows from the TVmaze REST API. The 2026 modernization keeps that small scope and adds strict typing, validation at the network boundary, safe rendering of third-party HTML, automated tests and a least-privilege CI workflow.

## What it does

- Searches TVmaze by title, with the query stored in the URL so results can be shared and bookmarked. An empty query falls back to the original default, `girls`.
- Shows a responsive grid of posters, titles and summaries.
- Opens a detail page with poster, premiere date, language, genres, rating and summary.
- Handles loading, empty, not-found, rate-limited, timeout, network and malformed-response states, with retry where it can help.
- Cancels in-flight requests when the query changes or the page unmounts.

It has no accounts, no contact form, no backend and no database, and it stores no user data. Search terms and show requests go directly from the browser to TVmaze, and posters load from TVmaze's image host, so those services receive the visitor's IP address.

## Architecture

```text
Browser
  React UI -> feature hooks -> shows client -> fetchJson -> TVmaze REST API
                                    |
                                    +-> parseShow (untrusted JSON -> domain model)
  RichText <- parseRichText (untrusted HTML -> allowlisted React nodes)
```

```text
.
|-- frontend/            React 19, TypeScript and Vite application
|   |-- build/           Build-time Content Security Policy plugin
|   |-- scripts/         Test report generator
|   |-- src/app/         Application shell and routes
|   |-- src/features/    Feature modules (shows: api, components, domain, pages)
|   |-- src/shared/      Config, HTTP, hooks, rich text and shared components
|   `-- tests/           Node-environment tests (CSP and SQL schema)
|-- db/schema.sql        Optional cache schema
|-- docs/                Architecture and security audit
`-- reports/tests/       Committed output of a real test run
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.

## Quick start

Requires Node.js `^24.15.0` or `>=26.0.0`; the test tooling does not support Node.js 25. Development and testing used 24.22.0, pinned in `frontend/.nvmrc`.

```bash
cd frontend
npm ci --ignore-scripts
npm run dev
```

Open the URL Vite prints, normally <http://localhost:5173>.

## Usage guide

| Route | Behavior |
| --- | --- |
| `/` | Searches for the default query |
| `/?q=breaking%20bad` | Searches for the given query |
| `/shows/169` | Opens one show |
| `/shows/169?q=breaking%20bad` | Opens one show and keeps the search for the Back link |

To produce and serve a production build:

```bash
npm run build
npm run preview
```

Any static host works if it rewrites unknown paths to `index.html`.

## Configuration

Copy `frontend/.env.example` to `frontend/.env` to override the default.

| Variable | Default | Rules |
| --- | --- | --- |
| `VITE_TVMAZE_API_URL` | `https://api.tvmaze.com` | HTTPS only (HTTP is accepted for loopback hosts); plain hostname; no credentials, query or fragment |

The value is compiled into the public bundle, so never put a secret in it. An invalid value fails the build.

## Database (optional)

**The application does not use a database.** [db/schema.sql](db/schema.sql) is an optional schema for anyone who wants to cache shows and search results. It has been applied on PostgreSQL 17 and on SQLite through sql.js.

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/schema.sql
```

## Testing

```bash
cd frontend
npm test               # unit, component and schema tests
npm run test:coverage  # with coverage
npm run test:report    # regenerates reports/tests/
npm run verify         # lint, types, coverage and production build
```

Tests stub the network and do not call TVmaze. The latest committed results are in [reports/tests/test-run.txt](reports/tests/test-run.txt) and [reports/tests/junit.xml](reports/tests/junit.xml).

## Security notes

- Third-party summaries are parsed inertly and rebuilt from an allowlist. The app has no `innerHTML` or `dangerouslySetInnerHTML`, and lint rules forbid them.
- Production builds ship a Content Security Policy without inline or evaluated scripts.
- Requests omit credentials and referrers, reject redirects, time out after 10 seconds and stop reading responses larger than 2 MB.
- API responses are validated before use; poster URLs must be HTTPS on TVmaze's image host, `static.tvmaze.com`.

See [SECURITY.md](SECURITY.md) and [docs/SECURITY_AUDIT.md](docs/SECURITY_AUDIT.md).

## Credits and licensing

- Show data comes from [TVmaze](https://www.tvmaze.com/api) under [CC BY-SA](https://creativecommons.org/licenses/by-sa/4.0/). The app displays this attribution in its footer, and any reuse of the data must follow those terms.
- The project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) (MIT). `frontend/public/favicon.ico` is the unchanged icon from its template; the license text is in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
- This repository does not currently include a license for its own code.
