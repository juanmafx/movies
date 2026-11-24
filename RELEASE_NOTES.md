# Release Notes: 1.0.0

Version 1.0.0 is a full modernization of the 2020 project. It keeps the original idea, browsing TV shows from TVmaze, on a current and hardened stack. This release has been prepared but not yet tagged or published.

## Highlights

- **Security:** third-party HTML no longer reaches an HTML sink, production builds ship a Content Security Policy, and `npm audit` reports 0 advisories, down from 217.
- **Stack:** TypeScript, React 19, React Router 8, Vite 8 and Node.js 24.
- **Features:** title search, shareable URLs, richer detail pages and clear error handling.
- **Quality:** automated tests, strict linting and a least-privilege CI workflow.

## Upgrading

1. Run the application from `frontend/` with Node.js 24.15 or newer.
2. Rename `REACT_APP_URL_API` to `VITE_TVMAZE_API_URL`.
3. Update saved links from `/<id>` to `/shows/<id>`.
4. Configure your host to rewrite unknown paths to `index.html`.

See [CHANGELOG.md](CHANGELOG.md) for the full list.
