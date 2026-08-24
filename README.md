# EV Scan MVP

A free, beginner-friendly used-EV buying assistant for UK shoppers.

## Product promise

**Paste the EV you're considering. We'll explain what matters.**

The interface is intentionally simple for people buying an EV for the first time. Technical information should always be translated into plain English and shown visually wherever possible.

## Current MVP

The frontend is live on Cloudflare Workers and includes a server-side DVSA MOT History API integration for registration lookups. Marketplace/listing data remains in demo mode until an approved Auto Trader integration is available.

Included in the MVP:

- Listing-link scan entry point
- Live UK registration lookup via DVSA MOT History API when credentials are configured
- Multi-stage scanning animation
- Visual Deal Score
- Separate Decision Confidence score
- Battery Confidence with estimated SoH range
- Estimated battery degradation timeline
- Summer / typical UK / cold motorway range
- MOT intelligence timeline
- Trim explorer
- 30-second plain-English verdict
- "What we like" / "What we'd check"
- Listing X-Ray for missing seller information
- Auto-generated seller message with copy button
- "What could change our verdict?"
- Effective purchase price
- Insurance estimator
- Personal EV Fit Score
- Beginner-friendly Find My EV questionnaire
- Similar-budget recommendations
- Same-car-better-listing / Save Money / Better Fit / Worth Stretching For recommendations
- Clear trust/limitations section
- Privacy, cookies, terms and affiliate-disclosure pages
- Global graceful-fallback layer for missing images, API outages and unexpected browser/runtime errors

## Important trust rules

The product must clearly distinguish:

1. **Verified** — supported by an authoritative source or supplied evidence.
2. **Estimated** — modelled from age, mileage, vehicle data or market information.
3. **Seller claim** — stated in an advert/message but not independently verified.
4. **Unknown** — information we do not have.

Never present an estimated battery-health figure as a measured State of Health. Deal Scores and recommendations must never be affected by advertising or affiliate commission.

## Graceful fallback policy

Missing or malformed data must never be replaced with invented certainty. Every integration and report renderer should follow these rules:

- Missing field → show `Unknown`, `Not supplied` or `Not available`.
- Missing photo → show a neutral vehicle/photo placeholder; never break the gallery.
- Empty MOT history → keep the report open and explain that no MOT records were returned.
- Partial vehicle identity → use whichever verified fields are available without failing the whole report.
- Provider timeout/outage → show a useful retry message while keeping unrelated features available.
- Malformed provider response → reject that field safely rather than passing broken data into the UI.
- Missing price/battery data → do not calculate a Deal Score that implies those inputs were known.
- External text rendered as HTML must be escaped.
- API calls should use finite timeouts and return structured errors.
- Browser storage must be optional; features should continue if localStorage is unavailable.
- Affiliate/partner failure must never affect scoring or core report availability.

`resilience.js` provides the browser-level safety net and legal footer links. Provider-specific adapters must still normalise their own data defensively.

## Architecture

### Now

- Static HTML/CSS/JavaScript frontend
- Cloudflare Worker backend
- GitHub as source of truth
- Cloudflare Workers/Assets for hosting
- DVSA MOT History API adapter
- Defensive Auto Trader adapter prepared for approved access
- No accounts
- No database
- No paywall

### DVSA production secrets

Sensitive DVSA credentials must be stored as encrypted Cloudflare Worker secrets and must never be committed to GitHub.

Required secret names:

- `DVSA_CLIENT_ID`
- `DVSA_CLIENT_SECRET`
- `DVSA_API_KEY`

The non-secret DVSA token URL, scope and API base are declared in `wrangler.jsonc`.

The Worker obtains and caches an OAuth access token server-side, then sends the bearer token and API key to DVSA. Browser JavaScript never receives the DVSA credentials.

### Next data layers

- Approved Auto Trader Search / Vehicles / Valuations access
- Vehicle/specification datasets
- Comparable-car market data
- Optional specialist provenance and battery-test partners

## Legal / compliance pages

Current prototype pages:

- `/privacy.html`
- `/cookies.html`
- `/terms.html`
- `/affiliate-disclosure.html`

The cookie/privacy wording must be reviewed before enabling analytics, behavioural advertising, conversion tracking, accounts, server-side review storage or other new personal-data processing. A dedicated privacy contact address must also be published before wider public launch.

## Product direction

Two main entry points:

### Scan a car
For buyers who already found an EV listing.

### Find my EV
For beginners who do not know what battery size, range or charging speed they need. Ask normal life questions and translate those answers into technical filters behind the scenes.

## Monetisation philosophy

Keep the core product free at launch. Monetisation should be useful and non-intrusive:

- Light automotive advertising
- Clearly labelled affiliate links
- Vehicle-history checks
- Independent battery testing
- Insurance
- Home charging
- EV tariffs
- Tyres / breakdown cover where contextually relevant

Commercial relationships must never alter Deal Scores or recommendations.

## Status

MVP in active development. DVSA-backed vehicle/MOT fields may be marked **VERIFIED** when returned by the live API. Price, battery, listing and marketplace-derived fields remain estimated, unknown or demo-only until their approved data sources are connected.
