# My EV Scan

## Product rule

Accounts are optional. Never block Scan a Car or Find My EV behind login.

The account pitch should be subtle: EV Scan is useful without an account; signing in only allows the service to remember useful information between visits/devices.

## Current logged-in features

- Saved scans
- Shortlist
- Compare up to four shortlisted scans
- Driving Profile
- Driving Profile prefill for Find My EV / EV Fit
- My Garage
- MOT / service / tax-VED / battery-warranty dates
- In-app due-soon reminders
- Calendar `.ics` reminder export
- Light/dark/system theme
- Pink/cyan/violet account accent
- Comfortable/compact account layout
- Reduced motion
- Advanced-data preference
- JSON account-data export
- Account deletion

## Authentication

Email + password was chosen for the first version because it requires no paid email provider or OAuth application.

Security controls:

- PBKDF2-SHA256 (210,000 iterations)
- Random per-user salt
- Random 32-byte session token
- Only SHA-256 session-token hashes stored in D1
- `HttpOnly; Secure; SameSite=Lax` session cookie
- 30-day session expiry
- Rate-limited sign-in/register attempts
- Generic invalid-login response

Future improvement: password reset will require a trustworthy email-delivery provider. Do not pretend password reset exists until that provider is connected.

## Database

Preferred binding: `EVSCAN_DB` (existing EV Scan D1 database).

Alternative binding: `ACCOUNTS_DB`.

`worker-entry.js` maps `EVSCAN_DB` to the account layer automatically. `account-schema.js` creates missing account tables with `CREATE TABLE IF NOT EXISTS`. Existing telemetry/review tables are untouched.

If neither D1 binding exists, `/api/account/status` reports `configured:false`; `account.js` does not install login/account UI and core EV Scan remains fully usable.

## Notifications

Current reminders are in-app and calendar-export based. They should never be described as email/push notifications.

Future email/push notifications require:

1. a reliable delivery provider;
2. verified sender/contact details;
3. user notification controls;
4. updated privacy/cookie wording where required;
5. clear unsubscribe/disable controls.

## Remaining launch requirements

- Confirm D1 binding exists in production.
- Confirm account tables initialise successfully.
- Test register/login/logout on the deployed origin.
- Test cross-device login.
- Test save/shortlist/compare/garage/export/delete.
- Add a real monitored privacy contact before wider public launch.
- Add password-reset delivery before treating accounts as production-mature.
