## What I found (current state)
- SEO is already partly implemented via Next.js Metadata in [layout.tsx](file:///f:/buildwithtanveer/eatsmartdaily/src/app/layout.tsx) plus per-page metadata on blog posts, taxonomy pages, and policy pages.
- There are a few “professional SEO” gaps that can hurt indexing/preview quality:
  - Many pages hardcode titles like "Blog | Eat Smart Daily" while the root layout already applies a title template "%s | Eat Smart Daily" → risk of duplicated titles.
  - Blog posts fall back to `/og-default.jpg` when no featured image, but that file does not exist in `public/` → social previews can 404.
  - Paginated pages (blog/category/tag) don’t have page-aware canonicals/robots → pagination SEO isn’t consistent.
  - Canonical/OG URLs are mixed absolute/relative across pages → easier to drift and misconfigure.

## SEO Improvements (implementation)
1. Normalize titles (avoid duplication)
   - Remove "| Eat Smart Daily" from per-page titles and let the root `title.template` handle the suffix.
   - Apply this consistently to blog listing, category/tag pages, static pages (about/contact/policies), not-found, etc.

2. Fix and standardize OG/Twitter images
   - Add a real default OG image in `public/` (e.g., `public/og-default.jpg`) sized 1200×630.
   - Update root metadata and all pages to reference the same default OG image instead of `/logo.svg`.
   - Keep blog posts using featuredImage when present; otherwise fall back to the default OG image.

3. Make canonicals consistent and correct
   - Standardize on `metadataBase` + relative canonicals (or all-absolute), but pick one approach everywhere.
   - Ensure `openGraph.url` matches canonical for each page.

4. Handle pagination professionally (blog/category/tag)
   - Convert blog listing to `generateMetadata` so it can read `searchParams.page`.
   - For page 1: canonical to `/blog`, index=true.
   - For page > 1: canonical to `/blog?page=N`, robots index=false (follow=true) to avoid thin/duplicate indexing.
   - Apply the same rule to category and tag pages.

5. Structured data cleanup (JSON-LD)
   - Ensure JSON-LD uses absolute URLs everywhere (some already do).
   - Improve Organization/WebSite schema on the homepage with `logo` as an ImageObject and `sameAs` from settings when available.
   - Ensure BlogPosting schema includes `mainEntityOfPage`, `publisher`, and uses the same image as OG.

## App “Works Correctly” Verification
1. Static checks
   - Run TypeScript diagnostics and ESLint.

2. Build/runtime checks
   - Run a production build and start the app.
   - Smoke-check key routes: `/`, `/blog`, a blog post, `/category/...`, `/tag/...`, `/search`, `/admin/login`, admin pages, and critical APIs.

3. Add a lightweight automated smoke check (optional but recommended)
   - Add a small script under `scripts/` that fetches a list of important routes and fails on non-200/3xx, so regressions are caught quickly.

## Deliverables
- Clean, consistent metadata across the entire public site (titles, canonicals, OG/Twitter).
- No missing default OG image (no 404 on social previews).
- Pagination handled in a search-engine-friendly way.
- A verified build + smoke-checked key pages/APIs.
