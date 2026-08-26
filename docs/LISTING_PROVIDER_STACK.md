# EV Scan listing provider stack

EV Scan uses a fail-closed, zero-spend listing pipeline. A user supplies one vehicle-listing URL. The Worker tries permitted/available providers in a controlled order, verifies the vehicle against official MOT data where possible, and only releases a report when the strict quality gate passes.

The operating rule is deliberately conservative: **accuracy and £0 spend are more important than scan completion rate**. If the free providers cannot supply enough reliable evidence, EV Scan refuses the scan instead of guessing, opening a partial report, or moving onto a paid tier.

## Cloudflare secrets

Add these as Worker secrets, never as plain text in GitHub or frontend JavaScript:

- `FIRECRAWL_API_KEY` — recommended extraction fallback for difficult permitted listing pages. Use only the ongoing free allowance; never enable paid overage or top-ups.
- `JINA_API_KEY` — optional. Jina Reader also supports basic keyless usage. Recheck its current commercial/free terms before public launch.
- `REEF_API_KEY` — optional/experimental Auto Trader resolver. Keep `REEF_AUTOTRADER_ENABLED="false"` until the commercial/terms position for the intended Auto Trader use is confirmed in writing.

Existing DVSA secrets remain required for the official MOT/vehicle verification path:

- `DVSA_CLIENT_ID`
- `DVSA_CLIENT_SECRET`
- `DVSA_API_KEY`

The existing non-secret `DVSA_TOKEN_URL`, `DVSA_SCOPE`, and `DVSA_API_BASE` stay in `wrangler.jsonc`.

Cloudflare Workers AI is configured through the `AI` binding in `wrangler.jsonc`; it does not need a separate application API key.

## MarketCheck decision

**MarketCheck is not part of EV Scan's production provider stack.**

Its onboarding terms presented on 26 August 2026 state that the initial free credits expire after 14 days and continued API access requires at least a £25 prepaid balance. The highlighted terms also prohibit persistent caching/archiving of MarketCheck responses and prohibit using MarketCheck data to build or enrich a competing data product.

That conflicts with EV Scan's permanent £0 requirement and with previous ideas such as caching MarketCheck-backed reports or using MarketCheck records to seed an EV Scan market database. Those ideas are retired.

Do not add a MarketCheck API key, payment method, prepaid balance or automatic top-up to EV Scan.

## Zero-spend rules

1. Do not add a card, prepaid balance, paid subscription, pay-as-you-go pack or automatic top-up to any provider for the MVP.
2. Provider exhaustion must never weaken the evidence gate. A quota failure should fall through only to another provider capable of supplying the same class of evidence.
3. If no free provider can replace a required source, EV Scan returns an unavailable response and generates no report.
4. A provider returning a quota/rate-limit error is put into cooldown so repeated requests do not immediately hammer an exhausted allowance.
5. Do not persist third-party provider responses when that provider's terms prohibit caching or archiving.
6. The direct Auto Trader API integration is retired. The old `/api/autotrader/*` routes return HTTP 410 and are not part of the live scanner.
7. Do not manufacture a market valuation or Deal Score from incomplete market evidence. Until a genuinely permanent £0 market-comparison source is connected, live reports must not claim that a car is above/below market or display a price-based Deal Score.

## Experimental Auto Trader switch

`wrangler.jsonc` deliberately defaults:

`REEF_AUTOTRADER_ENABLED = "false"`

A Reef key can be stored safely without EV Scan using it. Only change this flag to `true` after the provider route has been tested and the commercial/terms position is acceptable.

Restricted aggregator domains are not sent through the generic direct/Jina/Firecrawl chain. This avoids making EV Scan depend on unauthorised scraping as its production architecture.

## Fail-closed policy

A live report is refused when any critical requirement used by that report is missing or conflicting. The current non-market gate should require, at minimum:

- make and model
- model year
- asking price from the advert
- mileage from the advert
- matched UK registration
- usable advert description
- at least one vehicle image
- successful DVSA vehicle/MOT verification
- confirmed battery-electric identity
- matching listing and DVSA identity
- battery/range specifications only when those sections are shown

If a provider returns a rate/quota error, the router falls through where another provider can perform the same job. If the final evidence set still cannot pass the gate, the API returns an error and the frontend does not open a partial report.

## Provider order

For ordinary permitted dealer websites:

1. direct Worker fetch + deterministic extraction
2. Jina Reader
3. Firecrawl
4. DVSA verification
5. Cloudflare Workers AI structures advert content but is not treated as an independent factual source

For restricted marketplace domains, EV Scan does not use the generic scraper chain. Auto Trader has an optional Reef-specific route, disabled by default.

## Accuracy rules

- Extraction services reading the same advert do not count as independent confirmations of a fact.
- DVSA wins for MOT/vehicle identity.
- The advert remains the source for the current asking price and seller claims.
- Battery State of Health is never fabricated from an advert.
- No market-position claim is shown without a legitimate independent comparison source.
- A pretty but incomplete report is considered a failed scan.

## Possible free fallback to test later

Cloudflare Browser Run may be useful as an additional renderer for difficult permitted dealer websites if its free allowance remains available. Add it only after real-world URL testing shows that direct/Jina/Firecrawl coverage needs another fallback.