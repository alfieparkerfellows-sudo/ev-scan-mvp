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

## Live cornerstone guide cluster

### Battery health
- `/ev-guides/how-long-do-electric-car-batteries-last`
- `/ev-guides/how-much-do-ev-batteries-degrade`
- `/ev-guides/what-is-good-battery-health-for-used-ev`
- `/ev-guides/how-to-check-electric-car-battery-health-before-buying`

### Buying a used EV
- `/ev-guides/what-to-check-before-buying-used-electric-car`
- `/ev-guides/should-i-buy-high-mileage-electric-car`
- `/ev-guides/are-used-electric-cars-reliable`
- `/ev-guides/is-buying-a-used-electric-car-worth-it`

### Range & charging / living with an EV
- `/ev-guides/how-much-electric-car-range-do-i-need`
- `/ev-guides/why-does-electric-car-range-drop-in-winter`
- `/ev-guides/can-you-own-an-electric-car-without-home-charging`

### Running costs
- `/ev-guides/how-much-does-electric-car-insurance-cost`

## Next cluster: model buying guides

Create these only when we can add meaningful model-specific information.

Priority order:
1. Tesla Model 3
2. Tesla Model Y
3. MG4 EV
4. Volkswagen ID.3
5. Hyundai Ioniq 5
6. Kia EV6
7. Nissan Leaf
8. Polestar 2
9. Skoda Enyaq
10. Kia e-Niro / Niro EV

Suggested structure:
- `/cars/tesla/model-3`
- `/cars/tesla/model-3/common-problems`
- `/cars/tesla/model-3/real-world-range`
- `/cars/tesla/model-3/battery-health`
- `/cars/tesla/model-3/trims`

Only split sub-pages when the content is substantial enough to avoid cannibalisation.

## Next cluster: commercial-intent searches

Priority pages:
- Best used EVs under £10,000
- Best used EVs under £15,000
- Best used EVs under £20,000
- Best used EVs for first-time EV buyers
- Best used EVs without home charging
- Best used EVs for motorway driving
- Best used EVs for long range
- Cheapest used EVs to insure

Primary CTA: **Find My EV**.

## Next cluster: comparisons

Examples:
- Tesla Model 3 vs Polestar 2 used
- Hyundai Ioniq 5 vs Kia EV6
- MG4 vs Volkswagen ID.3
- Skoda Enyaq vs Volkswagen ID.4
- Tesla Model Y vs Skoda Enyaq

Comparison pages should explain *who each car suits*, not simply list specifications.

## Page template

Every guide should follow this order:

1. Breadcrumbs
2. Query-matching H1
3. **Short answer** box immediately visible
4. 3 key takeaways
5. Helpful explanation sections
6. Practical “what this means when buying used” guidance
7. Context-specific CTA
8. 3 closely related internal links
9. Methodology / uncertainty note
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

- Server-rendered HTML for indexable pages
- Unique title + meta description per page
- Canonical URL per page
- Robots meta
- Open Graph / Twitter metadata
- Article structured data on guides
- Breadcrumb structured data on guides
- WebSite / Organization / FAQ structured data on homepage
- XML sitemap generated from the guide database
- `robots.txt` allows Google and OAI-SearchBot
- Strong crawlable internal links
- Clean 404 state with `noindex,follow`
- Mobile-first layout
- No unnecessary JavaScript dependency for article content

## Domain migration

The current canonical base is the temporary `workers.dev` URL. When EV Scan receives its permanent domain:

1. Change the `SITE_URL` constant in `seo-guides.js` and `home-seo.js`.
2. Add the custom domain in Cloudflare.
3. 301 redirect the workers.dev hostname to the preferred domain if possible.
4. Verify the domain in Google Search Console.
5. Submit `/sitemap.xml`.
6. Confirm canonical tags and sitemap use only the new hostname.

## Measurement once the domain is live

Use Google Search Console to track:
- Queries gaining impressions
- Pages with impressions but weak CTR
- Positions 5–20 that can be improved
- New long-tail questions people discover us through
- Pages competing for the same query

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

Do not publish statistics until sample size, data rights and methodology are adequate. Original data should strengthen the content rather than create misleading precision.
