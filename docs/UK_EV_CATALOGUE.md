# UK EV historical catalogue

EV Scan's `uk-ev-catalogue.js` is generated from three UK Department for Transport vehicle-licensing CSV files:

- `df_VEH0120_GB.csv` — make / model / fuel / licence-status records.
- `df_VEH0124_AM.csv` — manufacture-year records for makes A–M.
- `df_VEH0124_NZ.csv` — manufacture-year records for makes N–Z.

The raw government CSVs are intentionally **not committed** to the repository. They are large source files and should be re-downloaded from the official UK vehicle-licensing data release when the catalogue is refreshed.

## Current generated catalogue

The 26 August 2026 source files produce:

- 5,905 battery-electric rows across all body types.
- 3,015 battery-electric **car** rows.
- 1,768 unique battery-electric car variants.
- 138 makes.
- 1,628 variants with an exact `YearManufacture` record in VEH0124.

The earlier temporary build reported 1,579 variants with manufacture-year evidence. Rebuilding directly from the uploaded source CSVs gives 1,628 exact make + generic-model + model matches. EV Scan uses the reproducible result from the source files rather than preserving the earlier session's lower count.

## Safety / evidence rules

This catalogue is supporting evidence only.

It **must not**:

- replace DVSA registration/MOT verification;
- invent battery capacity, usable battery, WLTP range or real-world range;
- select a trim/derivative when several catalogue candidates match;
- release a listing report by itself;
- be presented as proof that a particular registration has a particular derivative.

A lookup can return multiple candidates. `exact: true` is only returned when the make/model/year filter leaves one catalogue record.

## Rebuild

Install Python + pandas, then run:

```bash
python scripts/build_uk_ev_catalogue.py \
  --fuel /path/to/df_VEH0120_GB.csv \
  --am /path/to/df_VEH0124_AM.csv \
  --nz /path/to/df_VEH0124_NZ.csv \
  --out uk-ev-catalogue.js
```

The output is deterministic for the same inputs.

## Next data layer

The historical catalogue identifies UK battery-electric models/variants and manufacture-year evidence. It does **not** contain battery/range specifications.

The next layer is the VCA car fuel/emissions dataset, which can contribute official EV specification fields such as electric range/energy-consumption where present. Historical VCA archives are needed for discontinued vehicles and older derivatives.
