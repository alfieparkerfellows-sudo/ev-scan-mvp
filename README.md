# EV Scan MVP

A free, beginner-friendly used-EV buying assistant for UK shoppers.

## Product promise

**Paste the EV you're considering. We'll explain what matters.**

The interface is intentionally simple for people buying an EV for the first time. Technical information should always be translated into plain English and shown visually wherever possible.

## Current product

The frontend is hosted on Cloudflare Workers/Assets with GitHub as the source of truth. DVSA MOT History integration is prepared for live registration lookups; marketplace/listing data remains limited until approved Auto Trader access is connected.

Core buying experience:

- Listing-link / registration scan entry points
- Deal Score + separate Decision Confidence
- Battery Confidence and estimated SoH ranges without pretending to measure SoH
- Summer / typical UK / cold motorway range
- MOT intelligence
- Trim explorer
- Plain-English verdict
- Listing X-Ray / missing information
- Seller-message assistant
- Effective purchase price
- Insurance estimator
- Personal EV Fit check
- Beginner-friendly Find My EV questionnaire
- Similar-budget recommendations
- SEO guide/model/comparison/use-case library
- Privacy, cookies, terms and affiliate disclosure
- Graceful fallbacks for missing data, images and provider outages

## My EV Scan — optional accounts

Core scanning remains usable without an account. Accounts exist only to make EV Scan more useful for people who want the service to remember things between visits.

Logged-in features:

- Saved scans
- Buying shortlist
- Compare up to four shortlisted scans side by side
- Reusable Driving Profile
- My Garage for owned EVs
- In-app MOT, service, tax/vehicle-duty and battery-warranty reminders
- Downloadable calendar reminders (`.ics`)
- Light / dark / system theme
- Pink / electric-blue / violet account accent
- Comfortable / compact account layout
- Reduced-motion option
- Advanced-data preference
- Account data export
- Account deletion

The saved Driving Profile is reused as the starting point for Find My EV and the report-level EV Fit check so users do not have to re-enter the same normal driving information every time.

### Account security

- Passwords are never stored in readable form.
- Password verification uses PBKDF2-SHA256 with a per-account random salt and a high iteration count.
- Session tokens are random, stored server-side only as SHA-256 hashes, and delivered to the browser using `HttpOnly; Secure; SameSite=Lax` cookies.
- Login/register attempts are rate-limited using privacy-minimised hashed attempt keys.
- Sessions are time-limited.
- Users can export or delete account data from My EV Scan → Preferences.

### Account database

The account layer reuses the existing Cloudflare D1 binding when `EVSCAN_DB` is available. A separate `ACCOUNTS_DB` binding is also supported if we ever choose to isolate account data.

`worker-entry.js` calls `ensureAccountSchema()` before enabling accounts. Account tables use `CREATE TABLE IF NOT EXISTS`, so an existing EV Scan D1 database can be extended without removing telemetry/review tables.

Schema sources:

- `account-schema.js` — safe runtime initialisation
- `migrations/0001_accounts.sql` — explicit migration copy for manual/CLI use

If no D1 binding is present, account UI stays hidden and core scanning continues normally.

## Important trust rules

The product must clearly distinguish:

1. **Verified** — supported by an authoritative source or supplied evidence.
2. **Estimated** — modelled from age, mileage, vehicle data or market information.
3. **Seller claim** — stated in an advert/message but not independently verified.
4. **Unknown** — information we do not have.

Never present an estimated battery-health figure as a measured State of Health. Deal Scores and recommendations must never be affected by advertising or affiliate commission.

## Graceful fallback policy

Missing or malformed data must never be replaced with invented certainty.

- Missing field → `Unknown`, `Not supplied` or `Not available`.
- Missing photo → neutral placeholder.
- Empty MOT history → keep the report open and explain it.
- Partial identity → use whichever verified fields are available.
- Provider timeout/outage → useful retry state; unrelated features remain available.
- Malformed response → reject the field safely.
- Missing price/battery data → never calculate a misleading Deal Score.
- External text rendered as HTML must be escaped.
- API calls use finite timeouts.
- Browser storage is optional.
- Affiliate/partner failure never affects scoring or report availability.
- Missing account database → accounts stay unavailable without affecting scanning.

`resilience.js` provides the browser-level safety net; provider adapters and account routes still validate their own inputs defensively.

## Worker architecture

- `worker-entry.js` — outer account-aware entrypoint
- `worker-admin.js` — admin/data/telemetry layer
- `worker.js` — core scan/SEO/static application worker
- `account-api.js` — account authentication, profile, scans and garage API
- `account-schema.js` — D1 account-table initialisation
- `admin-api.js` — internal event/review/admin data layer
- `autotrader.js` — prepared marketplace adapter

`wrangler.jsonc` points to `worker-entry.js`.

## DVSA production secrets

Sensitive credentials must be stored as encrypted Cloudflare Worker secrets and never committed to GitHub.

Required secret names:

- `DVSA_CLIENT_ID`
- `DVSA_CLIENT_SECRET`
- `DVSA_API_KEY`

The non-secret token URL, scope and API base are declared in `wrangler.jsonc`.

## Next data layers

- Approved Auto Trader Search / Vehicles / Valuations access
- Stronger vehicle/specification datasets
- Comparable-car market data
- Specialist provenance/history provider
- Battery-data/testing partner
- Charging-location data
- Optional email/push reminder delivery after a reliable notification provider is connected

## Legal / compliance pages

- `/privacy.html`
- `/cookies.html`
- `/terms.html`
- `/affiliate-disclosure.html`

Privacy/cookie/terms wording now covers optional accounts, secure session cookies, saved scans and My Garage. A real monitored privacy-contact address remains a pre-public-launch requirement.

## Monetisation philosophy

Keep the core product free. Monetisation should be contextual and useful:

- Clearly labelled affiliate links
- Vehicle-history checks
- Independent battery testing
- Insurance
- Home charging
- EV tariffs
- Amazon EV essentials where genuinely relevant
- Potential B2B/dealer product later

Commercial relationships must never alter Deal Scores or recommendations.

## Status

MVP in active development. DVSA-backed vehicle/MOT fields may be marked **VERIFIED** when returned by the live API. Price, battery, listing and marketplace-derived fields remain estimated, unknown or demo-only until approved data sources are connected.
