# EV Scan listing provider stack

EV Scan 0.8.3 uses a fail-closed, zero-spend listing pipeline. A user supplies one vehicle-listing URL. The Worker tries the permitted/available providers in a controlled order, independently matches the vehicle, verifies the registration/MOT record, and only releases a report if the strict quality gate passes.

The operating rule is deliberately conservative: **accuracy and £0 spend are more important than scan completion rate**. If the free providers cannot supply enough reliable evidence, EV Scan refuses the scan instead of guessing, opening a partial report, or automatically moving onto a paid tier.

## Cloudflare secrets

Add these as Worker secrets, never as plain text in GitHub or frontend JavaScript:

- `FIRECRAWL_API_KEY` — recommended extraction fallback. Firecrawl currently has an ongoing $0 plan with 1,000 free credits per month and no card required.
- `JINA_API_KEY` — optional. Jina Reader also supports basic keyless usage; a free key can provide higher limits, but free-key token/licensing terms should be rechecked before any commercial launch.
- `MARKETCHECK_API_KEY` — currently required for independent UK listing matching and comparable asking-price data. MarketCheck's current Starter plan is £0/month **plus data fees** and includes 1,000 free API calls to get started; this is starter credit, not a guaranteed recurring free monthly allowance. Do not attach billing for EV Scan's zero-spend MVP.
- `REEF_API_KEY` — optional/experimental Auto Trader resolver. Reef currently starts accounts with 1,000 free credits and no card. Do not enable the Auto Trader route until EV Scan has written confidence that the intended use of source-derived data is acceptable.

Existing DVSA secrets remain required for the strict live report:

- `DVSA_CLIENT_ID`
- `DVSA_CLIENT_SECRET`
- `DVSA_API_KEY`

The existing non-secret `DVSA_TOKEN_URL`, `DVSA_SCOPE`, and `DVSA_API_BASE` stay in `wrangler.jsonc`.

Cloudflare Workers AI is configured through the `AI` binding in `wrangler.jsonc`; it does not need a separate application API key. On the Workers Free plan, Cloudflare currently provides 10,000 AI neurons per day at no charge and further operations fail after the free limit rather than generating paid overage on the Free plan.

## Zero-spend rules

1. Do not add a card, prepaid balance, paid subscription, pay-as-you-go pack, or automatic top-up to any provider for the MVP.
2. Provider exhaustion must never weaken the evidence gate. A quota failure should fall through only to another provider capable of supplying the same class of evidence.
3. If no free provider can replace a required source, EV Scan returns a retry/unavailable response and generates no report.
4. A provider returning HTTP 429 is put into cooldown so repeated requests do not immediately hammer an exhausted allowance.
5. Successful verified scans are cached in D1 for 30 minutes. Failed or incomplete scans are never cached. This protects free quotas when the same listing is scanned repeatedly.
6. The direct Auto Trader API integration is retired. The old `/api/autotrader/*` routes return HTTP 410 and are not part of the live scanner.
7. MarketCheck is currently the market-comparison bottleneck. When its starter allowance is exhausted, market-dependent scans must refuse rather than inventing price intelligence until a genuinely zero-cost replacement is connected.
8. EV Scan enforces an internal lifetime ceiling of **900 uncached MarketCheck-backed scan attempts**, below the currently advertised 1,000 starter calls. The remaining allowance is exposed internally through `/api/health`. This deliberately leaves a safety buffer and prevents EV Scan from intentionally entering MarketCheck's paid data-fee usage even if billing is later added by mistake.

## Experimental Auto Trader switch

`wrangler.jsonc` deliberately defaults:

`REEF_AUTOTRADER_ENABLED = "false"`

A Reef key can be stored safely without EV Scan using it. Only change this flag to `true` after the provider route has been tested and the commercial/terms position is acceptable.

Restricted aggregator domains are not sent through the generic direct/Jina/Firecrawl chain. This avoids making EV Scan depend on unauthorised scraping as its production architecture.

## Fail-closed policy

A live report is refused when any critical requirement is missing or conflicting. The current gate requires, at minimum:

- make and model
- model year
- asking price
- mileage
- matched UK registration
- EV battery-capacity specification
- EV range specification
- useful advert description
- at least one vehicle image
- independent MarketCheck vehicle match
- at least five comparable vehicles with a median asking price
- successful DVSA vehicle/MOT verification
- confirmed battery-electric identity
- matching listing and DVSA identity

If a provider returns a rate/quota error, the router falls through where another provider can perform the same job. If the final evidence set still cannot pass the gate, the API returns an error and the frontend does not open a partial report.

## Provider order

For ordinary dealer websites:

1. direct Worker fetch + deterministic extraction
2. Jina Reader
3. Firecrawl
4. MarketCheck matching/comparables
5. DVSA verification
6. Cloudflare Workers AI structures advert content but is not treated as an independent factual source

For restricted marketplace domains, EV Scan does not use the generic scraper chain. Auto Trader has an optional Reef-specific route, disabled by default.

## Accuracy rules

- Extraction services reading the same advert do not count as independent confirmations of a fact.
- DVSA wins for MOT/vehicle identity.
- MarketCheck is used for independent inventory matching and market comparables while free starter access remains available.
- The advert remains the source for seller claims and the current asking price.
- Battery State of Health is never fabricated from an advert. A live report states that SoH is not measured unless measured evidence becomes available in a future provider.
- Market position means comparable current asking prices, not guaranteed sale value.
- A pretty but incomplete report is considered a failed scan.

## Possible free fallback to test later

Cloudflare Browser Run is available on the Workers Free plan with 10 browser minutes per day. It may be useful as an additional renderer for difficult permitted dealer websites, but it is not connected in EV Scan 0.8.3 yet. Add it only after real-world URL testing shows that direct/Jina/Firecrawl coverage needs another fallback.
