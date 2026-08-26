import assert from 'node:assert/strict';
import { lookupUkEvCatalogue, ukEvCatalogueStats } from '../uk-ev-catalogue.js';

const stats = ukEvCatalogueStats();
assert.equal(stats.variants, 1768);
assert.equal(stats.makes, 138);
assert.equal(stats.sourceBatteryElectricRows, 5905);
assert.equal(stats.sourceBatteryElectricCarRows, 3015);
assert.equal(stats.withYearEvidence, 1628);

for (const query of [
  { make:'Nissan', model:'Leaf', year:2015 },
  { make:'BMW', model:'i3', year:2018 },
  { make:'Renault', model:'Zoe', year:2017 },
  { make:'Tesla', model:'Model 3', year:2021 },
  { make:'Volkswagen', model:'ID.3', year:2022 }
]) {
  const result = lookupUkEvCatalogue(query);
  assert.equal(result.matched, true, `${query.make} ${query.model} ${query.year} should match`);
  assert.ok(result.candidateCount >= 1);
  assert.equal(result.evidence, 'UK_DFT_VEHICLE_LICENSING');
}

const impossible = lookupUkEvCatalogue({ make:'Nissan', model:'Leaf', year:1901 });
assert.equal(impossible.matched, false);

const ambiguous = lookupUkEvCatalogue({ make:'Nissan', model:'Leaf', year:2015 });
assert.equal(ambiguous.exact, false, 'generic Leaf lookup must not silently choose a derivative');

console.log('UK EV catalogue: checks passed');
