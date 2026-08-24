# EV Scan report data contract — v1

The frontend should eventually render from one report object rather than hard-coded vehicle values. Every provider must map its data into this shape.

```json
{
  "reportVersion": "1.0",
  "scanId": null,
  "input": {
    "listingUrl": null,
    "registration": null
  },
  "vehicle": {
    "registration": null,
    "make": null,
    "model": null,
    "trim": null,
    "year": null,
    "mileage": null,
    "fuelType": "Electric",
    "batteryKwhUsable": null,
    "batteryKwhGross": null,
    "drivetrain": null,
    "colour": null,
    "images": []
  },
  "listing": {
    "source": null,
    "askingPrice": null,
    "sellerType": null,
    "sellerName": null,
    "description": null,
    "url": null,
    "evidence": "UNKNOWN"
  },
  "price": {
    "marketEstimate": null,
    "difference": null,
    "percentile": null,
    "score": null,
    "evidence": "UNKNOWN"
  },
  "battery": {
    "confidenceScore": null,
    "confidenceLabel": "Unknown",
    "expectedSohLow": null,
    "expectedSohHigh": null,
    "measuredSoh": null,
    "warrantyEnd": null,
    "evidence": "UNKNOWN"
  },
  "range": {
    "summerMiles": null,
    "typicalUkMiles": null,
    "coldMotorwayMiles": null,
    "evidence": "UNKNOWN"
  },
  "charging": {
    "peakDcKw": null,
    "tenToEightyMinutes": null,
    "connector": null,
    "evidence": "UNKNOWN"
  },
  "mot": {
    "tests": [],
    "score": null,
    "summary": null,
    "repeatedThemes": [],
    "mileageAnomalies": 0,
    "evidence": "UNKNOWN"
  },
  "listingXray": {
    "score": null,
    "known": [],
    "unknown": [],
    "sellerClaims": []
  },
  "scores": {
    "deal": null,
    "dealCompleteness": 0,
    "fit": null,
    "decisionConfidence": null,
    "verdict": "Not enough data"
  },
  "actions": {
    "sellerMessage": null,
    "thingsToCheck": [],
    "whatCouldChangeVerdict": []
  },
  "recommendations": [],
  "limitations": []
}
```

## Evidence values

Use only:

- `VERIFIED`
- `ESTIMATED`
- `SELLER_CLAIM`
- `USER_SUPPLIED`
- `UNKNOWN`

## Image rule

`vehicle.images` must contain the **actual images for that specific live listing** when marketplace access permits it. A generic model photo can be used only in clearly labelled demo/editorial contexts, never presented as the photographed car for a live used listing.

## Missing-data rule

Null values remain null. Do not silently replace missing values with believable-looking demo numbers. The UI should explain what is missing and why it matters.
