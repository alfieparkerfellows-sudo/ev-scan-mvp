# EV Scan listing provider stack

EV Scan 0.9.0 uses a **fail-closed, zero-spend** scanner with two separate modes:

1. **Listing-link scan** — reads a permitted vehicle advert, extracts only evidence present in the advert, verifies the vehicle against DVSA and releases a report only if the strict listing quality gate passes.
2. **UK registration scan** — uses the existing DVSA path and remains available independently of Firecrawl listing credits.

The operating rule is: **accuracy and £0 spend are more important than scan completion rate.** EV Scan does not silently downgrade to a partial listing report, fabricate missing data or move onto a paid provider when a free allowance runs out.

## Active production stack

### Direct Cloudflare Worker fetch

First attempt for ordinary permitted dealer websites. It costs no third-party API credits and extracts deterministic page data before Workers AI structures it.

### Firecrawl

Cloudflare secret:

- `FIRECRAWL_API_KEY`

Firecrawl is the primary third-party fallback for pages the direct fetch cannot read sufficiently. EV Scan uses only the recurring free allowance.

EV Scan queries Firecrawl's authenticated `GET /v2/team/credit-usage` endpoint to obtain the provider's current:

- remaining credits
- plan credits
- billing-period start
- billing-period end / reset date

The result is exposed through `/api/listing-status` and `/api/health`. The frontend shows the real remaining-credit/reset information instead of maintaining a guessed local counter.

If Firecrawl reports zero credits, or EV Scan cannot safely confirm the credit status, **new listing-link scans are paused before a report is generated**. The message explicitly tells users that UK registration checks remain available.

### Cloudflare Browser Run

Cloudflare binding:

- `BROWSER`

This is a last-resort renderer for difficult **permitted** dealer websites after direct extraction and Firecrawl. It uses Cloudflare's free Browser Run allowance and requires no third-party API key.

### Cloudflare Workers AI

Cloudflare binding:

- `AI`

Workers AI converts extracted advert content into EV Scan's schema. It is not an independent factual source. The prompt expressly forbids inventing fields or filling battery/range values from general model knowledge when the supplied advert content does not support them.

### DVSA

Existing Cloudflare secrets:

- `DVSA_CLIENT_ID`
- `DVSA_CLIENT_SECRET`
- `DVSA_API_KEY`

Existing configuration:

- `DVSA_TOKEN_URL`
- `DVSA_SCOPE`
- `DVSA_API_BASE`

DVSA remains the authority for the official vehicle/MOT identity path. Registration-only scans are deliberately independent of Firecrawl credits.

## Provider order for a permitted listing

1. Direct Worker fetch
2. Firecrawl
3. Cloudflare Browser Run
4. Workers AI structures extracted content at each useful stage
5. DVSA verifies the vehicle/MOT identity
6. Strict evidence gate
7. Report or refusal

A provider is skipped once the current evidence is complete enough. EV Scan does not call every provider unnecessarily.

## Firecrawl exhaustion behaviour

Before a link scan EV Scan checks Firecrawl's live allowance. If the free allowance is unavailable, the listing scan returns HTTP 503 with `LISTING_CREDITS_EXHAUSTED` and no report.

User-facing wording is intentionally transparent, for example:

> Listing-link scans have used this period's free allowance. They are due back on 26 September 2026. UK registration checks are still available.

The date is supplied dynamically by Firecrawl; it is not hard-coded.

## Strict listing quality gate

A live listing report currently requires all of the following:

- make
- model
- model year
- advert asking price
- advert mileage
- UK registration
- battery-capacity specification supported by extracted content
- EV range specification supported by extracted content
- usable advert description
- at least one vehicle image
- at least one successful advert-extraction provider
- successful DVSA vehicle/MOT verification
- confirmed battery-electric identity
- matching listing/DVSA vehicle identity

If any required element is missing or materially conflicts, **no listing report is released**.

This gate intentionally reduces coverage. A visually impressive but incomplete or guessed report is considered a failed scan.

## What a successful listing report may show

- exact advert vehicle details that were successfully extracted
- current asking price from the advert
- mileage
- registration
- trim/derivative when explicitly supported
- advert description and image
- battery capacity and listed/rated range only when the extracted evidence supports them
- verified DVSA/MOT history and MOT intelligence
- model-specific EV Scan checks from the internal guide data
- seller questions based on information absent from the advert
- decision confidence / evidence status

## What EV Scan deliberately does not claim yet

- measured battery State of Health from a listing
- an independent market valuation
- above/below-market pricing
- live comparable adverts
- a price-based Deal Score
- finance/write-off/provenance clearance
- facts unsupported by the listing or official verification data

`scoring.deal` is therefore `null` for the current live listing report.

## Restricted marketplace policy

The generic direct/Firecrawl/Browser Run pipeline is **not** used for restricted aggregator domains currently including Auto Trader, MOTORS, CarGurus and Facebook Marketplace.

For these domains EV Scan returns `SOURCE_REQUIRES_APPROVED_PROVIDER`. It does not attempt to bypass access controls or depend on unauthorised scraping.

Auto Trader's direct API route remains retired and `/api/autotrader/*` returns HTTP 410.

## Rejected or inactive providers

### MarketCheck — rejected

Not part of production. Its onboarding terms presented on 26 August 2026 conflicted with EV Scan's £0 policy and imposed restrictions around persistent caching/data reuse. Do not add billing, prepaid balance or a MarketCheck key for this MVP.

### Jina Reader — inactive

Not in the production route. We are avoiding a Jina API-key dependency while its free/commercial licensing position is not appropriate for this MVP.

### ReefAPI — inactive

Not in the production route. Starting credits are not a recurring permanent free tier and third-party marketplace rights remain a concern. Do not use it as EV Scan's production Auto Trader workaround.

## Zero-spend rules

1. No card, prepaid balance, paid subscription, automatic top-up or paid overage provider should be required for the MVP.
2. Exhausting a free allowance may reduce availability; it must never reduce the evidence standard.
3. Listing scans fail closed when a required free service is unavailable.
4. Registration-only scans remain independent wherever the DVSA service is available.
5. Provider secrets remain server-side in Cloudflare and never appear in frontend code or GitHub.
6. Third-party provider responses are not persisted as a general data warehouse/cache by the listing pipeline.
7. Market claims remain disabled until a legitimate source with acceptable economics and terms is connected.

## Monitoring endpoints

- `/api/listing-status` — user-safe Firecrawl listing allowance status, remaining credits and reset date.
- `/api/provider-status` — active provider/binding configuration and policy status.
- `/api/health` — overall EV Scan capability/configuration health including listing status and DVSA health inherited from the base Worker.

The provider status endpoint never returns API keys.
