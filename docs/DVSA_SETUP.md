# DVSA MOT API setup

EV Scan now has a Cloudflare Worker endpoint at `POST /api/scan` which can use live DVSA MOT history by registration.

## 1. Register with DVSA

Register for the MOT history API as an individual or business. DVSA supplies:

- client ID
- client secret
- scope URL
- access-token URL
- API key

The application can take up to 5 working days to review.

## 2. Add Cloudflare secrets

Add these as **Worker secrets**, never as public frontend variables and never commit real values to GitHub:

- `DVSA_CLIENT_ID`
- `DVSA_CLIENT_SECRET`
- `DVSA_TOKEN_URL`
- `DVSA_API_KEY`

Optional:

- `DVSA_SCOPE` — defaults to `https://tapi.dvsa.gov.uk/.default`
- `DVSA_API_BASE` — defaults to `https://history.mot.api.gov.uk`

## 3. Check configuration

Request:

`GET /api/health`

When secrets are present, `liveMotConfigured` should be `true`.

## 4. Test a registration scan

Request body:

```json
{
  "registration": "AB12CDE"
}
```

Send it to:

`POST /api/scan`

The Worker retrieves live DVSA vehicle/MOT data, normalises it, detects repeated defect themes and mileage anomalies, and returns a transparent MOT score and confidence information.

## Trust rules

- DVSA vehicle/MOT data is labelled `VERIFIED`.
- Battery SoH stays `UNKNOWN` unless we receive real battery evidence.
- Price stays `UNKNOWN` until a reliable market/listing data source is connected.
- Listing claims stay `UNKNOWN` until a marketplace or supplied advert is analysed.
- Never infer finance/write-off/theft status from MOT data.
