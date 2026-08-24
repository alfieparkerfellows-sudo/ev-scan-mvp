# EV Scan MVP

A free, beginner-friendly used-EV buying assistant for UK shoppers.

## Product promise

**Paste the EV you're considering. We'll explain what matters.**

The interface is intentionally simple for people buying an EV for the first time. Technical information should always be translated into plain English and shown visually wherever possible.

## Current MVP

This first version is a static frontend prototype designed to run cheaply on Cloudflare Pages. It currently uses clearly labelled demo data so the user experience can be perfected before live vehicle APIs are added.

Included in the MVP:

- Listing-link scan entry point
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
- Seller-reply checker prototype
- "What could change our verdict?"
- Effective purchase price
- Personal EV Fit Score
- Beginner-friendly Find My EV questionnaire
- Similar-budget recommendations
- Same-car-better-listing / Save Money / Better Fit / Worth Stretching For recommendations
- Clear trust/limitations section

## Important trust rules

The final product must clearly distinguish:

1. **Verified** — supported by an authoritative source or supplied evidence.
2. **Estimated** — modelled from age, mileage, vehicle data or market information.
3. **Seller claim** — stated in an advert/message but not independently verified.
4. **Unknown** — information we do not have.

Never present an estimated battery-health figure as a measured State of Health. Deal Scores and recommendations must never be affected by advertising or affiliate commission.

## Architecture

### Now

- Static HTML/CSS/JavaScript
- GitHub as source of truth
- Cloudflare Pages for hosting
- No accounts
- No database
- No paywall

### Later

A small Cloudflare Worker can securely handle external API calls while keeping credentials out of the public frontend.

Potential data layers include:

- DVSA MOT History API
- Vehicle/specification datasets
- Valuation / comparable-car data
- Approved marketplace integrations
- AI analysis for listing and seller-response interpretation
- Optional specialist provenance and battery-test partners

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

Frontend MVP in active development. All current vehicle data is illustrative demo data and must not be used as purchasing advice.
