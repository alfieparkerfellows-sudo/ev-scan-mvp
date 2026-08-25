# EV Scan listing provider stack

EV Scan 0.8 uses a fail-closed listing pipeline. A user supplies one vehicle-listing URL. The Worker tries the permitted/available providers in a controlled order, independently matches the vehicle, verifies the registration/MOT record, and only releases a report if the strict quality gate passes.

## Cloudflare secrets

Add these as Worker secrets, never as plain text in GitHub or frontend JavaScript:

- `MARKETCHECK_API_KEY` — required for independent UK listing matching and comparable asking-price data.
- `FIRECRAWL_API_KEY` — recommended fallback for JavaScript-heavy dealer websites.
- `JINA_API_KEY` — recommended for higher Reader API limits; anonymous Jina Reader is still supported as a fallback.
- `REEF_API_KEY` — optional/experimental Auto Trader resolver. Do not enable until EV Scan is satisfied that the intended commercial use is acceptable.

Existing DVSA secrets remain required for the strict live report:

- `DVSA_CLIENT_ID`
- `DVSA_CLIENT_SECRET`
- `DVSA_API_KEY`

The existing non-secret `DVSA_TOKEN_URL`, `DVSA_SCOPE`, and `DVSA_API_BASE` stay in `wrangler.jsonc`.

Cloudflare Workers AI is configured through the `AI` binding in `wrangler.jsonc`; it does not use an application API key in the frontend.

## Experimental Auto Trader switch

`wrangler.jsonc` deliberately defaults:

`REEF_AUTOTRADER_ENABLED = "false"`

A Reef key can be stored safely without EV Scan using it. Only change this flag to `true` after the provider route has been tested and the commercial/terms position is acceptable.

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

For restricted marketplace domains, EV Scan does not use the generic scraper chain. Auto Trader has an optional Reef-specific route, disabled by default.

## Accuracy rules

- Extraction services reading the same advert do not count as independent confirmations of a fact.
- DVSA wins for MOT/vehicle identity.
- MarketCheck is used for independent inventory matching and market comparables.
- The advert remains the source for seller claims and the current asking price.
- Battery State of Health is never fabricated from an advert. A live report states that SoH is not measured unless measured evidence becomes available in a future provider.
