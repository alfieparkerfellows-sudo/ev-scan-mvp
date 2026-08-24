# EV Scan SEO Plan

## Goal

Own the search journey for UK buyers researching a used electric car for the first time, then funnel high-intent visitors into **Scan a car** or **Find My EV**.

EV Scan should not publish thin pages for every keyword variation. Each indexable URL must answer one distinct user problem clearly and be useful enough to stand on its own.

## Core SEO principles

1. **Answer first.** Put a concise, direct answer immediately below the H1.
2. **One search intent per page.** Avoid pages that compete with each other for the same query.
3. **Plain English first.** Translate EV terminology into buyer decisions.
4. **Evidence labels stay consistent.** Verified, Estimated, Seller claim, Unknown.
5. **No fake precision.** Battery SoH, insurance, future costs and range estimates must be labelled honestly.
6. **Relevant CTA per page.** The CTA should solve the exact problem the visitor searched for.
7. **Internal linking by topic cluster.** Every guide links to closely related pages rather than random articles.
8. **Server-rendered HTML.** Core answers and article content must be present in the initial HTML response.
9. **Original data wins later.** Once DVSA and Auto Trader are live, model pages should be enriched with EV Scan’s own market/MOT observations.
10. **No doorway-page spam.** Do not generate near-identical city, year or keyword variants without genuinely different content.

## Current published SEO footprint

### 12 cornerstone beginner guides

Battery health:
- `/ev-guides/how-long-do-electric-car-batteries-last`
- `/ev-guides/how-much-do-ev-batteries-degrade`
- `/ev-guides/what-is-good-battery-health-for-used-ev`
- `/ev-guides/how-to-check-electric-car-battery-health-before-buying`

Buying a used EV:
- `/ev-guides/what-to-check-before-buying-used-electric-car`
- `/ev-guides/should-i-buy-high-mileage-electric-car`
- `/ev-guides/are-used-electric-cars-reliable`
- `/ev-guides/is-buying-a-used-electric-car-worth-it`

Range, charging and ownership:
- `/ev-guides/how-much-electric-car-range-do-i-need`
- `/ev-guides/why-does-electric-car-range-drop-in-winter`
- `/ev-guides/can-you-own-an-electric-car-without-home-charging`

Running costs:
- `/ev-guides/how-much-does-electric-car-insurance-cost`

### 10 used-EV model guides

- `/cars/tesla/model-3`
- `/cars/tesla/model-y`
- `/cars/hyundai/ioniq-5`
- `/cars/kia/ev6`
- `/cars/mg/mg4-ev`
- `/cars/volkswagen/id-3`
- `/cars/nissan/leaf`
- `/cars/polestar/2`
- `/cars/skoda/enyaq`
- `/cars/kia/niro-ev`

Model guides answer the buying question first, then cover versions, used checks, charging/battery context, supported recall/warranty notes where available, and a model-specific Scan CTA.

### 5 used-EV comparison pages

- `/compare/hyundai-ioniq-5-vs-kia-ev6`
- `/compare/tesla-model-3-vs-polestar-2`
- `/compare/mg4-vs-volkswagen-id3`
- `/compare/tesla-model-y-vs-skoda-enyaq`
- `/compare/nissan-leaf-vs-kia-e-niro`

Comparison pages explain **who each car suits**, where each wins, what to check and why the condition/value of the exact used car can change the answer.

### 4 buyer-intent shortlist pages

- `/best/first-used-electric-car`
- `/best/used-electric-car-for-motorway-driving`
- `/best/used-electric-car-without-home-charging`
- `/best/used-electric-car-for-families`

Primary CTA: **Find My EV**.

## Deliberately held until Auto Trader live data

Do not publish fixed-price shortlist pages until we can keep them accurate with approved live marketplace data:

- Best used EVs under £10,000
- Best used EVs under £15,000
- Best used EVs under £20,000
- Best used EVs under £25,000
- Cheapest good used EVs currently for sale
- Current best-value used EV deals

These are high-value commercial searches but go stale quickly. Once Auto Trader access is connected, generate them from current allowed market data and show a clear **last updated** date.

Also hold “cheapest EVs to insure” rankings until we have a defensible insurance-data method. The current EV Scan insurance feature is an estimator, not a live insurer-pricing database.

## Future model sub-pages

Only split a model guide into additional URLs when there is enough unique information to avoid cannibalisation. Potential examples:

- `/cars/tesla/model-3/common-problems`
- `/cars/tesla/model-3/real-world-range`
- `/cars/tesla/model-3/battery-health`
- `/cars/tesla/model-3/trims`

The parent model page should remain the broad “used buyer guide” page. Sub-pages must answer narrower searches substantially better than the parent.

## Next expansion priorities

### More model guides

Use real search impressions plus used-market relevance to decide the order. Likely candidates:
- BMW i3
- Renault Zoe
- Volkswagen ID.4
- Audi Q4 e-tron
- Hyundai Kona Electric
- Kia Soul EV
- Vauxhall Corsa Electric
- Peugeot e-208
- Ford Mustang Mach-E
- Jaguar I-PACE

### More high-intent comparisons

Potential next pages:
- Skoda Enyaq vs Volkswagen ID.4
- Hyundai Kona Electric vs Kia e-Niro
- MG4 vs Tesla Model 3
- BMW i3 vs Nissan Leaf
- Peugeot e-208 vs Vauxhall Corsa Electric

Build these based on impressions and actual user behaviour rather than filling every possible pairing.

## Page template

Every question/model page should follow this order:

1. Breadcrumbs
2. Query-matching H1
3. **Short answer** box immediately visible
4. Key decision context
5. Helpful explanation sections
6. Practical “what this means when buying used” guidance
7. Context-specific CTA
8. Closely related internal links
9. Methodology / uncertainty / official-source note where relevant
10. Last-updated date

## CTA mapping

- Battery queries → **Scan the EV / check battery evidence**
- MOT / buying checklist queries → **Scan the exact car**
- Insurance queries → **Scan + insurance estimator**
- Range / charging fit queries → **Find My EV**
- Budget / best-car pages → **Find My EV**
- Model/common-problem pages → **Scan this model’s listing**
- Comparisons → **Scan the one you are considering / Find My EV**

## Homepage FAQ scope

Homepage FAQ is only for EV Scan product questions:
- What is EV Scan?
- Is EV Scan free?
- Can EV Scan check MOT history?
- Can EV Scan check an Auto Trader advert?
- Can EV Scan estimate battery health?
- Does EV Scan estimate insurance?
- How accurate is EV Scan?
- Does advertising affect recommendations?

Actual EV questions belong on standalone guide URLs.

## Technical SEO checklist

Implemented:
- Server-rendered HTML for indexable pages
- Unique title + meta description per page
- Canonical URL per page
- Robots meta
- Open Graph metadata
- Article / collection structured data
- Breadcrumb structure on guide pages
- WebSite / Organization / FAQ structured data on homepage
- XML sitemap generated from guide, model, comparison and shortlist databases
- `robots.txt` allows Google and OAI-SearchBot
- Crawlable homepage links into EV Guides and Model Guides
- Clean 404 state with `noindex,follow`
- Mobile-first layouts
- No JavaScript dependency for core article text
- API responses explicitly `noindex`

Still required when permanent domain is ready:
- Google Search Console verification
- Bing Webmaster Tools / IndexNow consideration
- Submit sitemap
- Monitor indexing / crawl errors
- Add permanent branded social sharing image

## Domain migration

The current canonical base is the temporary `workers.dev` URL. When EV Scan receives its permanent domain:

1. Change the `SITE_URL` constants in `seo-guides.js`, `seo-models.js`, `seo-intent.js` and `home-seo.js`.
2. Add the custom domain in Cloudflare.
3. 301 redirect the workers.dev hostname to the preferred domain if possible.
4. Verify the domain in Google Search Console.
5. Submit `/sitemap.xml`.
6. Confirm canonical tags and sitemap use only the new hostname.
7. Confirm OAI-SearchBot and other desired crawlers still receive 200 responses.

## Measurement once the domain is live

Use Google Search Console to track:
- Queries gaining impressions
- Pages with impressions but weak CTR
- Positions 5–20 that can be improved
- New long-tail questions people discover us through
- Pages competing for the same query
- Model guides earning impressions for narrower “problems”, “battery”, “range” or “trim” searches that may justify dedicated sub-pages

Expand based on real impressions rather than guessing indefinitely.

## Model-data opportunity after API integrations

Once DVSA and Auto Trader are stable, use aggregated/allowed data to add genuinely original information to model pages where licensing permits, for example:
- Typical asking-price bands
- Typical mileage bands
- Current listing volume
- Common MOT themes
- Price versus mileage patterns
- Trim availability
- Market-position context
- “better than X% of comparable listings” only when the sample and methodology support it

Do not publish statistics until sample size, data rights and methodology are adequate. Original data should strengthen the content rather than create misleading precision.
