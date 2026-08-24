# EV Scan scoring method

The product must not invent a single opaque AI score. Scores are deterministic summaries of evidence, and missing evidence must reduce confidence rather than silently being treated as good.

## Deal Score

Initial weighting:

| Component | Weight |
| --- | ---: |
| Price position | 30% |
| MOT / vehicle history signals | 20% |
| Battery confidence | 20% |
| Condition indicators | 15% |
| Warranty / age position | 10% |
| Listing quality / transparency | 5% |

Each available component is scored from 0–100. If a component is unavailable, the score is calculated from the evidence that exists **and the completeness percentage is shown separately**.

This is why EV Scan should always show both:

- **Deal Score** — how strong the known evidence looks.
- **Decision Confidence** — how complete and reliable the evidence is.

A high Deal Score with low Decision Confidence should never be presented as a confident recommendation.

## Verdict bands

- 85–100: Strong candidate
- 70–84: Worth considering
- 55–69: Investigate first
- 0–54: High risk

These are decision-support labels, not guarantees that a car is mechanically sound.

## MOT intelligence

The first backend version starts an MOT history score at 100 and applies transparent deductions for signals such as:

- failed tests
- dangerous defects
- major defects
- advisories/minor defects
- repeated defect themes
- recorded mileage moving backwards

Repeated patterns matter more than isolated advisories. Categories currently include tyres, brakes, suspension, steering, lighting, windscreen/wipers and structural/body issues.

The MOT score is only one component of the overall Deal Score.

## Evidence labels

Every important datum should eventually carry one of these states:

- **VERIFIED** — authoritative API or uploaded evidence.
- **ESTIMATED** — modelled from known inputs.
- **SELLER CLAIM** — stated in an advert/message but unverified.
- **UNKNOWN** — we do not have enough evidence.

Do not convert `UNKNOWN` into an estimate unless there is a defensible model for doing so.
