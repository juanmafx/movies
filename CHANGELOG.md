# Changelog

This project follows [Semantic Versioning](https://semver.org/) and the [Keep a Changelog](https://keepachangelog.com/) format.

## [1.0.0] - Unreleased

### Breaking

- Show detail URLs moved from `/:id` to `/shows/:id`.
- The configuration variable `REACT_APP_URL_API` is now `VITE_TVMAZE_API_URL`.
- The application moved from `movies/` to `frontend/`.
- Node.js `^24.15.0` or `>=26.0.0` is required.

### Added

- Title search with shareable URLs, and show facts on the detail page.
- Loading, empty, error and retry states, plus a not-found route.
- TVmaze attribution in the footer.
- Automated tests, a committed test report and a GitHub Actions workflow.
- Optional database schema, architecture guide, security policy, audit and third-party notices.

### Changed

- Migrated to TypeScript, React 19, React Router 8 and Vite 8.
- Reorganized the code into feature and shared modules with English names.
- The detail page now requests a single show instead of refetching a search.

### Fixed

- Stored XSS exposure from rendering third-party summaries with `innerHTML`.
- Crashes on shows with no image.
- Request cancellation on unmount.

### Security

- Resolved all 217 `npm audit` advisories in the original lockfile.
- Added a Content Security Policy, response validation and a hardened request policy.
- Restricted poster URLs to TVmaze's image host, limited responses to 2 MB and rejected API hostnames that could alter the generated policy.

### Removed

- Create React App, unused dependencies and the empty `mts` placeholder file.

## [0.1.0] - 2020-11-19

- Initial version.
