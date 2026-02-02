## What I can guarantee vs what requires runtime validation
- I can do a full static audit of the repository: routes, auth logic, DB schema, data flows, and security controls.
- To guarantee “all functionality works completely”, we also need runtime verification: production build, server start, DB connectivity, and route/API smoke checks. Where features depend on external services (SMTP, GA, Sentry, ads), we validate configuration and failure modes.

## Current high-impact issues already found (to be documented + fixed)
- **Public data leak (critical):** `GET /api/posts` returns `author: true` which includes the full User record (including `password`) and returns drafts/scheduled posts. [posts/route.ts](file:///f:/buildwithtanveer/eatsmartdaily/src/app/api/posts/route.ts#L23-L34)
- **Public draft access (critical):** `GET /api/posts/[id]` returns any post by id without checking status/auth. [posts/[id]/route.ts](file:///f:/buildwithtanveer/eatsmartdaily/src/app/api/posts/[id]/route.ts#L7-L22)
- **PII exposure (high):** comments API returns user emails publicly. [comments/route.ts](file:///f:/buildwithtanveer/eatsmartdaily/src/app/api/posts/[id]/comments/route.ts#L16-L44)
- **Open email relay risk (critical):** multiple `/api/email/*` routes are unauthenticated; newsletter route uses a default `development-key` if env missing. [send-newsletter](file:///f:/buildwithtanveer/eatsmartdaily/src/app/api/email/send-newsletter/route.ts#L21-L31)
- **Cron secret misconfig footgun (critical):** backup cron endpoint allows execution if `CRON_SECRET` is missing. [cron/backup](file:///f:/buildwithtanveer/eatsmartdaily/src/app/api/cron/backup/route.ts#L11-L18)
- **Public ops recon (medium/high):** `/api/health` and `/api/metrics/report` expose internal diagnostics/telemetry if left public.

## Plan to “check each file” and produce application.md
### 1) Repository inventory (100% coverage)
- Enumerate every route (public pages, admin pages, API handlers, route groups).
- Enumerate every server action and its permissions.
- Enumerate Prisma models and mark sensitive fields (PII/secrets).
- Enumerate env vars used across the repo and classify as required/optional.

### 2) Functionality verification (runtime)
- Run TypeScript + lint + production build.
- Start production server and smoke-test:
  - Public pages: `/`, `/blog`, `/blog/[slug]`, `/category/[slug]`, `/tag/[slug]`, `/author/[id]`, `/search`, policy pages.
  - SEO endpoints: `/robots.txt`, `/sitemap.xml`, `/og`.
  - Admin login and a subset of admin screens.
  - API endpoints that should be public vs protected.
- Validate DB interactions: ensure all “public” reads only return published content.

### 3) Security review (systematic)
- AuthN/AuthZ: verify every `/api/admin/*` and sensitive `/api/*` route has correct session/role checks.
- Data exposure: ensure API responses never include `password`, SMTP settings, preview tokens, or emails unless strictly needed.
- Abuse prevention: add rate limits + auth to email/newsletter/metrics/upload/comment creation.
- Secret safety: remove unsafe defaults (e.g., newsletter key), avoid querystring secrets, ensure env-driven config.
- Attack surface: CSP correctness, upload limits, SSRF protections (link checker), and health/metrics access control.

### 4) Create application.md (single authoritative report)
I will create `application.md` containing:
- Tech stack and architecture overview
- Feature list (Public + Admin)
- Route inventory (Public pages, Admin pages, API routes)
- Data model summary (Prisma models + relations)
- Background jobs/cron tasks
- Security posture (what’s implemented)
- Findings (with severity: Critical/High/Medium/Low)
- Required improvements and missing implementations (prioritized checklist)
- Deployment/ops notes (env vars, third-party integrations)

### 5) Implement critical fixes (after report)
- Lock down public post APIs (published-only + safe selects).
- Remove emails from public comment payloads.
- Secure email endpoints (auth + rate limits + remove default keys).
- Fix cron secret logic and remove querystring secret usage.
- Gate health/metrics reporting appropriately.

If you approve this plan, I’ll generate `application.md` first (full inventory + findings), then apply the security fixes and re-run the full verification suite.