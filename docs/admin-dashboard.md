# EV Scan Admin Dashboard

The visual admin dashboard lives at `/admin`.

## Current state

The dashboard UI, admin API, review pipeline, product telemetry and D1 schema are built. Persistent data collection is intentionally OFF until the production launch/privacy phase.

## Production activation checklist

1. Create a Cloudflare D1 database for EV Scan.
2. Apply `schema.sql` to the database.
3. Bind the D1 database to the Worker as `EVSCAN_DB`.
4. Add a strong Cloudflare Worker secret named `ADMIN_TOKEN`.
5. Confirm the Privacy/Cookies/Terms wording covers the production analytics and review storage.
6. Set `DATA_COLLECTION_ENABLED=true` only after the privacy setup is ready.
7. Test `/admin` login and dashboard queries.
8. Submit test reviews, approve/hide/delete them in Admin, and verify homepage live-stat integration before public launch.

## Privacy design

The telemetry layer is designed not to store full vehicle registration numbers, IP addresses, email addresses, names, phone numbers or postal addresses. It stores product-level behaviour such as page path, traffic source, device class, scan outcome, make/model/year, provider performance and error codes. User-written review comments may naturally contain information the user chooses to type, so production privacy wording must account for that.

## Admin sections

- Overview and Product Health score
- Traffic/scans trend history
- User conversion funnel
- Automatic improvement opportunities
- Most scanned EVs
- Traffic sources and top pages
- Device breakdown
- Reviews moderation
- DVSA / Auto Trader API health
- Front-end error history
- Recent privacy-conscious activity stream
