# Application Audit Report (EatSmartDaily)

This document inventories the repository, explains what the application currently implements, and lists security/functionality gaps and recommended improvements (prioritized).

## 1) Tech Stack

- Framework: Next.js App Router (TypeScript)
- UI: React, Tailwind CSS
- Database: Prisma ORM (MySQL datasource)
- Authentication: NextAuth (Credentials + JWT)
- Observability: Sentry
- Media: `next/image`, Sharp-based server upload pipeline
- Email: Nodemailer-based services

Key configuration files:
- `next.config.ts` (security headers + CSP, images allowlist, Sentry config)
- `prisma/schema.prisma` (data model)
- `src/middleware.ts` (admin route auth middleware)
- `src/app/api/auth/[...nextauth]/route.ts` (NextAuth config)

## 2) High-Level Architecture

- Public site pages live under `src/app/(public)` (home, blog, category/tag/author pages, search, policies).
- Admin CMS lives under `src/app/admin/(authenticated)` and is protected by middleware (`/admin/*`) plus per-page access checks.
- APIs are implemented as route handlers under `src/app/api/*`.
- Admin automation uses cron-like endpoints under `src/app/api/cron/*`.
- Business logic is split across:
  - server actions under `src/app/actions/*`
  - libraries under `src/lib/*`

## 3) Feature Inventory (What the app has)

### 3.1 Public Website

Public pages (App Router):
- `/` (home)
- `/blog` (blog listing with pagination)
- `/blog/[slug]` (blog post)
- `/category/[slug]` (category listing)
- `/tag/[slug]` (tag listing)
- `/author/[id]` (author profile + posts)
- `/search` (search results, noindex)
- `/about`, `/contact`
- `/privacy-policy`, `/terms`, `/cookie-policy`, `/disclaimer`
- `/unsubscribe` (newsletter unsubscribe)

SEO/auxiliary routes:
- `/robots.txt` (`src/app/robots.ts`)
- `/sitemap.xml` (`src/app/sitemap.ts`)
- `/manifest.webmanifest` (`src/app/manifest.ts`)
- `/og` (OpenGraph image route: `src/app/og/route.ts`)
- `/ads.txt` (`src/app/ads.txt/route.ts`)

### 3.2 Blog / Content System

- Posts with status: `DRAFT | PUBLISHED | SCHEDULED` (see Prisma `Post.status`)
- SEO fields: `metaTitle`, `metaDescription`, `focusKeyword`
- Featured flags: `showInSlider`, `showInPopular`, `showInLatest`
- Categories + Tags (many-to-many via `PostTag`)
- Post version history (`PostVersion`)
- Preview token support (admin API generates preview URLs)
- Comments with nesting (replies) and activity logging

### 3.3 Admin CMS

Admin pages (authenticated route group):
- `/admin/dashboard`
- `/admin/posts`, `/admin/posts/new`, `/admin/posts/[id]`, `/admin/posts/[id]/history`
- `/admin/categories`, `/admin/tags`
- `/admin/media`
- `/admin/comments`
- `/admin/newsletter`, `/admin/newsletter/compose`
- `/admin/analytics`
- `/admin/backups`
- `/admin/ads`
- `/admin/redirects`
- `/admin/messages`
- `/admin/users`
- `/admin/profile`
- `/admin/settings`
- `/admin/email-settings`
- `/admin/tools`
- `/admin/activity`
- `/admin/recipes`

Admin login (public):
- `/admin/login`

### 3.4 Analytics / Monitoring

- View tracking endpoint: `/api/views`
- Admin analytics endpoint: `/api/admin/analytics`
- Web vitals reporting endpoint: `/api/metrics/report` (in-memory store)
- Health diagnostics endpoint: `/api/health`
- Sentry instrumentation hooks in `src/instrumentation*.ts`

### 3.5 Backups

- Admin backup list/download and restore endpoints: `/api/admin/backups`, `/api/admin/backups/[id]`, `/api/admin/backups/[id]/restore`
- Legacy “full backup export” endpoint: `/api/admin/backup`
- Automated backup cron endpoint: `/api/cron/backup`

## 4) Route Inventory (Complete)

### 4.1 Pages (all `page.tsx`)

Public:
- `src/app/(public)/page.tsx`
- `src/app/(public)/blog/page.tsx`
- `src/app/(public)/blog/[slug]/page.tsx`
- `src/app/(public)/category/[slug]/page.tsx`
- `src/app/(public)/tag/[slug]/page.tsx`
- `src/app/(public)/author/[id]/page.tsx`
- `src/app/(public)/search/page.tsx`
- `src/app/(public)/about/page.tsx`
- `src/app/(public)/contact/page.tsx`
- `src/app/(public)/privacy-policy/page.tsx`
- `src/app/(public)/terms/page.tsx`
- `src/app/(public)/cookie-policy/page.tsx`
- `src/app/(public)/disclaimer/page.tsx`
- `src/app/(public)/unsubscribe/page.tsx`

Admin:
- `src/app/admin/login/page.tsx`
- `src/app/admin/(authenticated)/*/page.tsx` (dashboard, posts, media, etc.)

Other (non-public utility routes):
- `src/app/preview/[token]/page.tsx` (preview rendering by token)
- `src/app/test-db/page.tsx` (database diagnostic page)
- `src/app/[...catchAll]/page.tsx` (catch-all)

### 4.2 Route Handlers (all `route.ts`)

Platform/SEO:
- `src/app/og/route.ts`
- `src/app/ads.txt/route.ts`

API:
- `src/app/api/*/**/route.ts` including:
  - Auth: `/api/auth/[...nextauth]`
  - Posts: `/api/posts`, `/api/posts/[id]`, `/api/posts/[id]/comments`
  - Categories: `/api/categories`
  - Views: `/api/views`
  - Upload: `/api/upload`
  - Email: `/api/email/send-*`
  - Admin: `/api/admin/*` (backups, analytics, email-settings, link checker, etc.)
  - Cron: `/api/cron/backup`, `/api/cron/publish-scheduled`
  - Metrics: `/api/metrics`, `/api/metrics/report`
  - Health: `/api/health`
  - Example: `/api/sentry-example-api`

## 5) Server Actions Inventory

Server action modules (`src/app/actions/*.ts`):
- `posts.ts` (post CRUD and admin behaviors)
- `categories.ts`, `tags.ts` (taxonomy CRUD)
- `comments.ts` (moderation/actions)
- `media.ts` (media management)
- `ads.ts` (ads management)
- `backup.ts` (backup-related actions)
- `redirects.ts` (redirect rules)
- `settings.ts` (site settings)
- `email-settings.ts` via API routes (SMTP)
- `newsletter.ts` (newsletter flows)
- `users.ts` (user management)
- `search.ts`, `share.ts`, `contact.ts`, `notifications.ts`

## 6) Data Model (Prisma) Summary

All models (16):
- `ActivityLog`, `Ad`, `Category`, `Comment`, `ContactMessage`, `NewsletterSubscriber`, `Post`, `PostTag`, `Redirect`, `SiteSettings`, `DailyStat`, `DailyVisitor`, `Tag`, `User`, `PostVersion`, `Backup`

Key relations (high level):
- `User` ↔ `Post` (author)
- `Post` ↔ `Category` (optional)
- `Post` ↔ `Tag` (many-to-many via `PostTag`)
- `Post` ↔ `Comment` (threaded comments via `parentId`)
- `Post` ↔ `PostVersion` (history)
- `Backup` stores serialized backup data in DB

Sensitive fields (must never be exposed publicly):
- `User.password`, `User.credentials`
- `SiteSettings.smtpSettings`
- `Post.previewToken`, `Post.previewExpiresAt`
- PII: `Comment.email`, `ContactMessage.email`, `NewsletterSubscriber.email`
- Tracking data: `ActivityLog.ipAddress`, `ActivityLog.userAgent`

## 7) Environment Variables (used by code)

Required in production:
- `DATABASE_URL` (Prisma DB connection)
- `NEXTAUTH_SECRET` (NextAuth signing)
- `NEXTAUTH_URL` (preview URL generation + auth callbacks)

Strongly recommended:
- `NEXT_PUBLIC_SITE_URL` (canonical URLs + metadata)
- `CRON_SECRET` (cron endpoints)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `SMTP_FROM_EMAIL` (email sending)
- `NEWSLETTER_API_KEY` (newsletter authorization)
- `EMAIL_API_KEY` (protects `/api/email/send-*` endpoints)
- `HEALTHCHECK_TOKEN` (protects `/api/health` in production)
- `METRICS_API_TOKEN` (metrics endpoint protection)
- `NEXT_PUBLIC_SENTRY_DSN` (Sentry client)
- `GIT_COMMIT_SHA` (Sentry release tagging)

Note:
- `.env*` files exist locally but are ignored by `.gitignore` (`.env*`). Do not commit secrets.

## 8) Security Controls (What exists today)

- Admin route protection via NextAuth middleware on `/admin/*` (`src/middleware.ts`)
- Role checks in many admin APIs (`ADMIN`, `EDITOR`, `AUTHOR`)
- CSP and security headers added globally in `next.config.ts`
- HTML sanitization used for user-generated content in blog rendering and comments (`src/lib/sanitizer`)
- Basic in-memory rate limiting (`src/lib/ratelimit.ts`) applied to some routes (login, post creation, views)
- Sentry instrumentation for error tracking

## 9) Findings + Required Improvements (Prioritized)

### Critical (must fix before production)

1) Public password leakage + draft leakage via posts API
- `/api/posts` returns `author: true` which includes the full `User` model (includes `password`) and returns all post statuses.
- Files:
  - `src/app/api/posts/route.ts`
- Fix:
  - Public GET must return only `PUBLISHED` posts and must use safe `select` for author (no password/credentials).

2) Public access to drafts/scheduled posts via `/api/posts/[id]`
- Files:
  - `src/app/api/posts/[id]/route.ts`
- Fix:
  - Gate GET by post status (only published) or require session for non-published.

3) Open email relay surface (spam/phishing risk)
- Unauthenticated email endpoints exist under `/api/email/*`.
- `send-newsletter` uses `development-key` when `NEWSLETTER_API_KEY` is missing.
- Files:
  - `src/app/api/email/send-newsletter/route.ts`
  - `src/app/api/email/send-password-reset/route.ts`
  - `src/app/api/email/send-welcome/route.ts`
  - `src/app/api/email/send-contact-response/route.ts`
  - `src/app/api/email/send-comment-notification/route.ts`
- Fix:
  - Require auth (admin session) OR enforce a required API key (no default).
  - Add strict rate limiting + input validation.
  - Password reset must be server-generated tokens (not caller-provided links).

4) Cron backup endpoint opens if `CRON_SECRET` is missing (misconfiguration footgun)
- Files:
  - `src/app/api/cron/backup/route.ts`
- Fix:
  - Fail closed when secret is missing (like `publish-scheduled` already does).
  - Remove querystring secrets; use only Authorization header.

5) Public diagnostic page (`/test-db`) exposes DB info and queries sensitive relations
- Files:
  - `src/app/test-db/page.tsx`
- Fix:
  - Remove in production, or protect behind admin auth and `NODE_ENV === development`.

### High

6) PII exposure risk in comments responses
- The comments API selects `email` from `User` and returns it in JSON.
- Files:
  - `src/app/api/posts/[id]/comments/route.ts`
- Fix:
  - Never return email in public comment payloads; return only id/name/image.

7) Metrics reporting/inspection endpoint is public
- `/api/metrics/report` stores and exposes URL/userAgent telemetry with no auth.
- Files:
  - `src/app/api/metrics/report/route.ts`
- Fix:
  - Require token, remove userAgent/url from public response, or disable in prod.

8) Upload route lacks size limits and robust error handling
- Files:
  - `src/app/api/upload/route.ts`
- Fix:
  - Enforce max file size, handle sharp failures, consider virus scanning (optional).

### Medium

9) Health endpoint leaks operational details publicly
- Files:
  - `src/app/api/health/route.ts`
- Fix:
  - Protect by token or restrict to internal; minimize details in public response.

10) Link checker can be used for SSRF-like probing if abused
- Admin-only, but it fetches arbitrary URLs from post content.
- Files:
  - `src/app/api/admin/check-links/route.ts`
- Fix:
  - Add outbound request allowlist/denylist (block RFC1918, localhost, metadata IPs), timeouts, concurrency caps.

### Low / Cleanup

11) Example routes/pages should not ship to production
- `src/app/api/sentry-example-api/route.ts`
- `src/app/sentry-example-page/page.tsx`

12) Lint warnings indicate potential maintainability issues
- The repo currently builds, but lint reports many warnings (mostly `any`, unused vars, and hook rules).

## 10) SEO Status

The app uses Next.js Metadata with:
- Root defaults in `src/app/layout.tsx`
- Per-page metadata for public pages
- Sitemap + robots routes
- JSON-LD schemas for key pages

Recent SEO improvements already applied:
- Standardized title templating and canonical URLs.
- Added `/og` OpenGraph image generator and updated metadata to use it.
- Added pagination-aware canonicals + noindex for page>1 listing pages.

## 11) Missing or Incomplete Implementations

- Complete password reset flow (token issuance/storage/verification + reset UI)
- Tests (unit/integration/e2e) and CI enforcement
- `.env.example` for safe onboarding
- Stronger distributed rate limiting (current limiter is in-memory)
- Hardening of public endpoints (comments spam prevention, metrics gating, health gating)

## 12) Recommended Next Steps (Checklist)

Phase 1 (security hotfixes):
- Lock down `/api/posts` and `/api/posts/[id]` to published-only and safe selects.
- Secure all `/api/email/*` endpoints and remove default newsletter key.
- Fix cron backup auth to fail closed; remove query param secret.
- Remove or protect `/test-db` and Sentry example endpoints.
- Remove email fields from comment payloads.

Phase 2 (reliability + correctness):
- Add request validation (Zod) to remaining mutation endpoints.
- Add size limits/timeouts for upload and link checker.
- Add e2e smoke tests for core routes/APIs.

Phase 3 (ops):
- Add `.env.example` and onboarding docs.
- Move rate limiting to a shared store (Redis/Upstash) for production scaling.

## 13) Audit Fixes Applied

The following security fixes were implemented as part of this audit:
- `/api/posts` now returns published-only posts with safe `author` selects (no password leakage).
- `/api/posts/[id]` now hides non-published posts from anonymous users.
- `/api/posts/[id]/comments` no longer returns user email addresses.
- `/api/email/send-*` endpoints now require either an admin session or `Authorization: Bearer $EMAIL_API_KEY` (and fail closed in production when not configured).
- `/api/email/send-newsletter` no longer accepts a default key; it requires an admin session or `Authorization: Bearer $NEWSLETTER_API_KEY`.
- `/api/cron/backup` now fails closed in production if `CRON_SECRET` is missing and no longer accepts querystring secrets.
- `/api/metrics` and `/api/metrics/report` now require `x-metrics-token` in production.
- `/api/health` is protected in production by `Authorization: Bearer $HEALTHCHECK_TOKEN`.
- `/test-db` is now admin-only and disabled in production; the Sentry example page was removed.
