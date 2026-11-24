# Architecture

## Context

Movies is a client-only single-page application. The browser talks directly to the public TVmaze REST API, which allows cross-origin requests and needs no API key. There is no server-side code, so a `backend/` directory would be empty; the application lives in `frontend/`.

## Module structure

```text
frontend/src/
|-- main.tsx                     Browser entry point
|-- app/
|   `-- App.tsx                  Layout and route table
|-- features/
|   `-- shows/
|       |-- api/                 HTTP client and response parsing
|       |-- components/          ShowCard, ShowPoster, ShowSearchForm
|       |-- domain/              Show model, query and id rules
|       `-- pages/               ShowListPage, ShowDetailPage
|-- shared/
|   |-- components/              StatusMessage
|   |-- config/                  API base URL validation, image origin
|   |-- hooks/                   useAsyncResource
|   |-- http/                    fetchJson, ApiError
|   `-- richText/                Allowlist parser and renderer
|-- styles/                      Global stylesheet
`-- test/                        Test setup and fixtures
```

Dependencies point inward: `app` uses `features`, `features` use `shared`, and `shared` never imports from a feature.

## Request flow

1. A page derives its input from the URL and memoizes a loader.
2. `useAsyncResource` runs the loader with an `AbortSignal`, ignores stale results and exposes `loading`, `success` or `error`.
3. `showsClient` builds the URL with encoded parameters and calls `fetchJson`.
4. `fetchJson` applies the timeout, request policy and 2 MB response limit, and maps failures to typed `ApiError` kinds.
5. `parseShow` converts unknown JSON into a `Show`, dropping invalid entries and any poster URL outside `https://static.tvmaze.com`.
6. `RichText` renders the summary as React elements.

## Key decisions

| Decision | Reason |
| --- | --- |
| Rebuild summaries as React nodes | No HTML sink exists, so escaping cannot be bypassed by a sanitizer gap |
| Hand-written response parsing | The payload is small, so a schema library would add bundle weight without much benefit |
| No data-fetching library | Two read-only requests do not justify a cache layer |
| URL as search state | Links are shareable and browser navigation works without a store |
| Fetch one show on the detail page | The original refetched a whole search and failed for shows outside it |
| CSP injected at build time | Vite's development server needs inline scripts that production must not allow |
| One image origin shared by the parser and the CSP | A poster the policy would block falls back to the placeholder instead of a broken image |

## Recommended production deployment

1. Serve `frontend/dist` from a static host or CDN over HTTPS with an `index.html` fallback.
2. Send the CSP as a response header and add `frame-ancestors 'none'`, which a `<meta>` policy cannot express.
3. Add `Strict-Transport-Security`, `X-Content-Type-Options: nosniff` and `Referrer-Policy: no-referrer`.
4. Cache hashed files under `assets/` as immutable, and revalidate `index.html`.

## Optional persistence

`db/schema.sql` models a cache: `shows`, `genres`, `show_genres` and `search_results`. Nothing in the application reads or writes it. Using it would require a backend, which should then live in a sibling `backend/` directory so that database credentials never reach the browser.
