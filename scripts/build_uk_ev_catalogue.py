#!/usr/bin/env python3
"""Build EV Scan's UK battery-electric vehicle catalogue from DfT VEH0120/VEH0124 CSVs.

Usage:
  python scripts/build_uk_ev_catalogue.py \
    --fuel df_VEH0120_GB.csv \
    --am df_VEH0124_AM.csv \
    --nz df_VEH0124_NZ.csv \
    --out uk-ev-catalogue.js

The raw government CSVs are intentionally not committed to the repository.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import pandas as pd

HEADER = """// Generated from UK Department for Transport vehicle licensing tables VEH0120 and VEH0124.
// Source files are not committed. Rebuild with scripts/build_uk_ev_catalogue.py.
// This catalogue is supporting evidence only; it must never replace DVSA verification
// or be used to invent battery capacity, range, trim or vehicle identity.

"""

RUNTIME = r"""
const CONTRADICTORY_POWERTRAIN = /\b(?:PHEV|MHEV|HYBRID[0-9]*|E HYBRID)\b/i;

function normalise(value = '') {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim();
}

function compact(value = '') {
  return normalise(value).replace(/\s+/g,'');
}

function tokenSet(value = '') {
  return new Set(normalise(value).split(' ').filter(Boolean));
}

function compatibleName(query, candidate) {
  const q = normalise(query), c = normalise(candidate);
  if (!q || !c) return false;
  if (q === c || q.includes(c) || c.includes(q)) return true;
  const qc = compact(q), cc = compact(c);
  if (qc === cc || (qc.length >= 3 && (qc.includes(cc) || cc.includes(qc)))) return true;
  const qt = tokenSet(q), ct = tokenSet(c);
  if (!qt.size || !ct.size) return false;
  let common = 0;
  for (const token of qt) if (ct.has(token)) common += 1;
  return common >= Math.min(2, qt.size, ct.size) && common / Math.min(qt.size,ct.size) >= 0.75;
}

export function lookupUkEvCatalogue({ make = '', model = '', year = null } = {}) {
  const makeKey = normalise(make);
  const modelKey = normalise(model);
  const yearNumber = Number(year);
  if (!makeKey || !modelKey) return { matched:false, exact:false, candidates:[], candidateCount:0 };

  const candidates = [];
  for (const row of ROWS) {
    const [rowMake, genModel, derivative, years] = row;
    if (normalise(rowMake) !== makeKey) continue;
    if (CONTRADICTORY_POWERTRAIN.test(normalise(`${genModel} ${derivative}`))) continue;
    if (!compatibleName(modelKey, genModel) && !compatibleName(modelKey, derivative)) continue;
    if (Number.isFinite(yearNumber) && Array.isArray(years) && years.length && !years.includes(yearNumber)) continue;
    candidates.push({ make:rowMake, genModel, model:derivative, manufactureYears:years });
  }

  return {
    matched:candidates.length > 0,
    exact:candidates.length === 1,
    candidates:candidates.slice(0,25),
    candidateCount:candidates.length,
    evidence:'UK_DFT_VEHICLE_LICENSING'
  };
}

export function ukEvCatalogueStats() {
  return { ...UK_EV_CATALOGUE_META };
}
"""

def read_csv(path: Path, columns: list[str]) -> pd.DataFrame:
    return pd.read_csv(path, encoding="cp1252", low_memory=False, dtype=str, usecols=columns)

def collect_years(series: pd.Series) -> list[int]:
    years: set[int] = set()
    for value in series.dropna():
        text = str(value).strip()
        if re.fullmatch(r"\d{4}", text):
            year = int(text)
            if 1900 <= year <= 2026:
                years.add(year)
    return sorted(years)

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--fuel", required=True, type=Path)
    parser.add_argument("--am", required=True, type=Path)
    parser.add_argument("--nz", required=True, type=Path)
    parser.add_argument("--out", default=Path("uk-ev-catalogue.js"), type=Path)
    args = parser.parse_args()

    fuel = read_csv(args.fuel, ["BodyType","Make","GenModel","Model","Fuel"])
    ev = fuel[(fuel["BodyType"] == "Cars") & (fuel["Fuel"] == "Battery electric")][
        ["Make","GenModel","Model"]
    ].drop_duplicates()

    vehicle_years = pd.concat([
        read_csv(args.am, ["BodyType","Make","GenModel","Model","YearManufacture"]),
        read_csv(args.nz, ["BodyType","Make","GenModel","Model","YearManufacture"]),
    ], ignore_index=True)
    vehicle_years = vehicle_years[vehicle_years["BodyType"] == "Cars"][
        ["Make","GenModel","Model","YearManufacture"]
    ].drop_duplicates()

    merged = ev.merge(vehicle_years, on=["Make","GenModel","Model"], how="left")
    catalogue = merged.groupby(["Make","GenModel","Model"], dropna=False).agg(
        years=("YearManufacture", collect_years)
    ).reset_index()

    rows = [[row.Make,row.GenModel,row.Model,row.years] for row in catalogue.itertuples(index=False)]
    contradictory = catalogue[
        catalogue["GenModel"].str.contains(r"\b(?:PHEV|MHEV|HYBRID[0-9]*|E[- ]HYBRID)\b", case=False, regex=True, na=False)
        | catalogue["Model"].str.contains(r"\b(?:PHEV|MHEV|HYBRID[0-9]*|E[- ]HYBRID)\b", case=False, regex=True, na=False)
    ]
    stats = {
        "variants": len(rows),
        "makes": int(catalogue["Make"].nunique()),
        "withYearEvidence": int(sum(bool(years) for years in catalogue["years"])),
        "sourceBatteryElectricRows": int((fuel["Fuel"] == "Battery electric").sum()),
        "sourceBatteryElectricCarRows": int(((fuel["BodyType"] == "Cars") & (fuel["Fuel"] == "Battery electric")).sum()),
        "quarantinedPowertrainNameConflicts": int(len(contradictory)),
    }

    output = (
        HEADER
        + "export const UK_EV_CATALOGUE_META = "
        + json.dumps(stats, separators=(",",":"))
        + ";\n"
        + "const ROWS = "
        + json.dumps(rows, separators=(",",":"), ensure_ascii=False)
        + ";\n"
        + RUNTIME
    )
    args.out.write_text(output, encoding="utf-8")
    print(json.dumps(stats, indent=2))
    print(f"Wrote {args.out} ({args.out.stat().st_size:,} bytes)")

if __name__ == "__main__":
    main()
