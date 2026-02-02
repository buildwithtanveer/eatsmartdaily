## What I found (current state)
- No automated tests are currently configured (no Jest/Vitest/Playwright/Cypress; no `test` scripts). [package.json](file:///f:/buildwithtanveer/eatsmartdaily/package.json#L8-L15)
- Input validation gaps exist in some API routes (example: categories POST accepts arbitrary `name`). [categories route](file:///f:/buildwithtanveer/eatsmartdaily/src/app/api/categories/route.ts#L12-L30)
- Upload API lacks file size limits and robust error handling. [upload route](file:///f:/buildwithtanveer/eatsmartdaily/src/app/api/upload/route.ts#L9-L48)
- Link checker fetches arbitrary external URLs; it needs SSRF hardening (block private/localhost ranges, disallow odd ports, add DNS resolution checks, add concurrency limits). [check-links route](file:///f:/buildwithtanveer/eatsmartdaily/src/app/api/admin/check-links/route.ts), [link-checker](file:///f:/buildwithtanveer/eatsmartdaily/src/lib/link-checker.ts)
- Lint currently reports many warnings (unused imports/vars, `any`, hook rules). The app still builds, but cleanup will improve maintainability.

## Implementation Plan (I will implement all items you listed)

### 1) Add automated tests (unit + optional e2e)
- Add **Vitest** unit test setup (fast, TS-friendly) with:
  - `vitest`, `@vitest/coverage-v8`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`.
  - `vitest.config.ts` + `src/test/setup.ts`.
  - `package.json` scripts: `test`, `test:watch`, `test:coverage`.
- Add initial unit tests that don’t require a real DB:
  - Sanitizer utilities (XSS stripping expectations).
  - URL extraction + SSRF-safe URL validator.
  - Upload validation helpers (size/type).
- Add **Playwright** e2e setup (recommended) with:
  - `@playwright/test` and `playwright.config.ts`.
  - Minimal smoke specs for public pages + key API responses.
  - A “no-DB required” mode: e2e tests only assert status codes/headers for routes that don’t require seeded DB.

### 2) Stricter validation (Zod)
- Add Zod schemas to routes that accept JSON:
  - `POST /api/categories` validate `name` (min/max) and trim.
  - `PUT /api/posts/[id]` validate all incoming fields; ensure `status` enum; ensure `categoryId` is number/null; ensure `publishedAt` is valid ISO when provided.
  - `POST /api/admin/check-links` validate `postIds` is an array of ints with an upper bound.
- Normalize error responses (`400` with flattened schema errors).

### 3) Upload limits + hardening
- Enforce `MAX_UPLOAD_BYTES` (default e.g. 5MB) by checking `file.size` before reading into memory.
- Add try/catch around Sharp processing and return safe errors.
- Add basic rate limiting on upload endpoint using existing limiter (`checkRateLimit`) keyed by IP.

### 4) SSRF hardening for link checker
- Add a shared helper (in `src/lib/link-checker.ts` or a new `src/lib/url-safety.ts`) that:
  - Allows only `http/https`.
  - Blocks localhost and private/link-local/metadata ranges.
  - Blocks non-standard ports (only 80/443 or empty).
  - Resolves DNS (`dns/promises`) and blocks if any A/AAAA records are private.
- Add concurrency limits when checking multiple links to avoid long-running requests (simple internal queue; no new dependency).
- Return a distinct status like `"Blocked"` for unsafe links.

### 5) Lint cleanup (reduce warnings significantly)
- Fix high-signal lint warnings without changing behavior:
  - Remove unused imports/vars.
  - Replace `any` where easy (especially in new/modified files).
  - Fix `react/no-unescaped-entities` strings.
  - Address `react-hooks/set-state-in-effect` warnings by refactoring patterns (useState initializers, derived state, or event-driven updates).
- Keep changes scoped to avoid risky refactors in business logic.

### 6) Verification
- Run: `lint`, `test`, `test:coverage`, `next build`.
- Add a small “security regression” test that asserts `/api/posts` output contains no `password` field.

If you approve, I will start implementing immediately: add test infrastructure first, then validations, upload hardening, SSRF protections, lint cleanup, and finish by running the full verification suite.