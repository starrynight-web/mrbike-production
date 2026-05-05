# CMS/DB Inconsistencies and Suggestions

## Purpose

This document captures the content/CMS system as it exists today, inconsistencies found between frontend, admin UI, and backend seeding, and suggested hardening steps for when backend/database access is available.

Current delivery constraint (for the design restoration work): **frontend-only**. Suggestions below may include backend work, but they are not required for the current visual-only restoration.

---

## Current CMS Architecture (As Implemented)

### Storage model

- Backend uses a key-value table: `backend/apps/core/models.py` (`SiteConfig` with `key`, `value`).
- Values are stored as strings. Many values are JSON strings.

### Public read API

- Public endpoint: `GET /api/v1/admin/site-config/` (see `frontend/src/config/constants.ts` `API_ENDPOINTS.SITE_CONFIG`).
- Implementation: `backend/apps/core/views.py` `PublicSiteConfigView`.
- Behavior: returns a flat JSON object of `{ key: value }` for all keys where `key` starts with `cms_`.

Security note: this design means any key that starts with `cms_` becomes publicly readable. That is fine for page content, but it is risky if sensitive data is ever stored under a `cms_` prefix.

### Admin read/write API

- Admin settings endpoint: `GET/POST /api/v1/admin/settings/`.
- Implementation: `backend/apps/core/views.py` `AdminSettingsView`.
- Behavior:
  - `GET` returns all keys as a flat dict.
  - `POST` upserts any provided keys.
  - list/dict values are JSON-stringified server-side.

### Admin UI editing surface

- Primary admin editor for these public pages is:
  - `frontend/src/app/admin/settings/page.tsx`
- This UI writes to the admin settings endpoint and edits keys like `cms_about_*`, `cms_faqs`, etc.

---

## CMS Keys Used by Public Pages (Contract Snapshot)

This is the practical “content contract” that must remain stable to preserve admin editability.

### About (`/about`)

- `cms_about_title` (string)
- `cms_about_subtitle` (string)
- `cms_about_content` (HTML string)
- `cms_about_stats` (JSON array of `{ value, label }`)
- `cms_about_values` (JSON array of `{ title, text }`)
- `cms_about_cta_title` (string)
- `cms_about_cta_desc` (string)

### Contact (`/contact`)

- `cms_contact_content` (HTML string) (rendered if present)
- `cms_contact_address` (string)
- `cms_contact_phone` (comma-separated string)
- `cms_contact_whatsapp` (string)
- `cms_contact_email` (comma-separated string)
- `cms_contact_hours` (comma-separated string)
- `cms_contact_map_url` (string, Google maps embed URL)

### Advertise (`/advertise`)

- `cms_advertise_hero_title` (string)
- `cms_advertise_hero_desc` (string)
- `cms_advertise_stats` (JSON array of `{ value, label }`)
- `cms_advertise_pricing_title` (string)
- `cms_advertise_pricing_desc` (string)
- `cms_advertise_plans` (JSON array of `{ name, description, price, period, features[], popular }`)
- `cms_advertise_content` (HTML string)

### FAQs (`/faqs`)

- `cms_faqs` (JSON array of `{ category, items: [{ q, a }] }`)
- `cms_faqs_cta_title` (string)
- `cms_faqs_cta_desc` (string)

### Support (`/support`)

- `cms_support_content` (HTML string)
- `cms_support_phone` (string)
- `cms_support_email` (string)

### Expense Calculator (`/services/expense-calculator`)

- `cms_expense_calculator_title` (string)
- `cms_expense_calculator_subtitle` (string)
- `cms_expense_calculator_content` (HTML string)

### Bike Registration (`/services/bike-registration`)

- `cms_bike_registration_content` (HTML string)
- `cms_bike_reg_license_fees` (JSON array of rows)
- `cms_bike_reg_steps` (JSON array of strings)
- `cms_bike_reg_smartcard_fees` (JSON array of rows)
- `cms_bike_reg_reg_fees` (JSON array of `{ cc, period, fee }`)
- `cms_bike_reg_docs_license` (JSON array of strings)
- `cms_bike_reg_docs_registration` (JSON array of strings)
- `cms_bike_reg_faqs` (JSON array of `{ q, a }`)

### Dealers (`/dealers`)

- Does not use `SiteConfig` today.
- Dynamically loads brand list from `GET /api/v1/bikes/brands/`.
- Most copy/stats/benefits are hardcoded in `frontend/src/app/dealers/page.tsx`.

---

## Inconsistencies Found

### 1) About seed key mismatch

- Observed in backend seed: `cms_about_story`.
- Observed in frontend/admin usage: `cms_about_content`.
- Impact: seeding can populate the wrong key; `/about` might show fallback content.
- Source: `backend/apps/core/management/commands/seed_site_config.py` vs `frontend/src/app/about/page.tsx` and `frontend/src/app/admin/settings/page.tsx`.

### 2) FAQ CTA seed key mismatch

- Observed in backend seed: `cms_faq_cta_title`, `cms_faq_cta_desc`.
- Observed in frontend/admin usage: `cms_faqs_cta_title`, `cms_faqs_cta_desc`.
- Impact: seeded CTA text may never appear.

### 3) Contact rich-content field not editable in admin UI

- Observed on public page: `/contact` renders `cms_contact_content`.
- Observed in admin UI: editor missing for `cms_contact_content`.
- Impact: content may exist (and render) but cannot be updated via admin.

### 4) Admin exposes fields that public pages may ignore

- Example: expense calculator title/subtitle are editable in admin.
- If the public page hardcodes hero copy, admins see no effect.
- Impact: perceived “broken CMS”.

### 5) Dealers editability is incomplete

- Only brand options are editable (via Brands CRUD), not the dealers page content blocks.
- Impact: stakeholders may expect CMS editability across the entire page.

---

## Frontend-Safe Mitigations (No Backend Required)

These are defensive steps the frontend can take without changing DB/APIs:

1. Add robust parsing for JSON CMS values.
   - Treat invalid JSON as empty arrays.
   - Avoid hard crashes due to a malformed admin edit.
2. Treat missing config data as `null` and use safe fallbacks.
3. Keep all layout structure in code; do not rely on admin-edited HTML to define page layout.
4. Standardize the wrapper styles around CMS HTML blocks (`prose` usage) to keep content consistent.

---

## Backend/CMS Hardening Suggestions (Requires DB/API Access)

1. Normalize key naming.
   - Decide on canonical keys.
   - Either migrate old keys or add alias reads.
2. Validate and version JSON CMS blobs.
   - Store schema version per key, or enforce structure server-side.
3. Add admin UI controls for any key consumed by public pages.
4. Introduce a dedicated CMS schema for page sections rather than arbitrary key sprawl.
5. Add a safety rail for the public endpoint.
   - Prefer explicit allowlist of public keys instead of prefix filtering, or enforce a separate “public” flag.

---

## Operational Checklist

1. Confirm which keys must be public.
2. Confirm which keys must be editable.
3. Confirm expected JSON shapes for each key.
4. Confirm seed data keys match the keys used by admin UI and public pages.

---

## Active Implementation Scope (Current Work)

- Frontend-only visual redesign.
- No backend/database/API changes.
- Preserve existing admin-driven content sources and keys.
