# Security Audit

**Scope:** version 1.0.0 on branch `modernize/2026`, audited in November 2026. This is a self-review backed by automated tooling, not an independent penetration test.

## Findings fixed

| Severity | Area | Finding | Resolution |
| --- | --- | --- | --- |
| High | XSS | Third-party summaries were written to `innerHTML` | Summaries are rebuilt from an allowlist as React nodes; lint rules ban HTML sinks |
| High | Dependencies | The original lockfile had 217 `npm audit` advisories (23 critical, 71 high, 114 moderate, 9 low) | Replaced the end-of-life toolchain; `npm audit` now reports 0 |
| Medium | Platform | React 17, Create React App 4 and React Router 5 are outdated | Migrated to React 19, Vite 8 and React Router 8 on Node.js 24 |
| Medium | Hardening | No Content Security Policy | Production builds include a restrictive policy |
| Medium | Input handling | API responses were trusted, and missing images crashed the UI | Responses are validated; only HTTPS image URLs are accepted |
| Low | Configuration | The API URL was unvalidated | The URL is validated and an invalid value fails the build |
| Low | Network | No timeout, and requests were not cancelled on unmount | Added a timeout and cancellation; requests omit credentials and reject redirects |
| Low | Repository | No `.gitignore` protected dependencies or environment files | Added ignore rules |

## Checks with no findings

- Tracked files and full git history were searched for private keys, environment files and common credential patterns.
- The application has no authentication, forms that change state, cookies, server code or SQL at runtime, so CSRF and SQL injection do not apply to it.
- No use of `eval` or `new Function` in the source; lint rules forbid them.

## Open items

- A `<meta>` policy cannot set `frame-ancestors` or other response headers. The hosting platform must send them, as described in [ARCHITECTURE.md](ARCHITECTURE.md).
- The application relies on TVmaze for availability and data integrity.

## Verification

- `npm audit`, ESLint, TypeScript strict mode and the automated tests, as recorded in `reports/tests/`.
- The production build was loaded in headless Chrome on the list, detail and invalid-id routes with no CSP violations.
- `db/schema.sql` was applied twice to a disposable PostgreSQL 17 container with no network access.
