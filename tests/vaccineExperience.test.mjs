import assert from 'node:assert/strict';
import { calculateVaccines } from '../herramientas/calculadora-vacunas/vaccines/vaccineCalculator.mjs';
import { resultExperience } from '../herramientas/calculadora-vacunas/resultExperience.mjs';

const now = new Date('2026-10-31T15:00:00Z');
const base = { species:'dog', approximate:{value:4,unit:'years'}, ill:'no', reaction:'no', history:'unknown', doses:[], risks:[], felv:'unknown' };
for (const species of ['dog','cat']) {
  for (const history of ['unknown','some','card']) {
    const input = {...base,species,history};
    const view = resultExperience(input,calculateVaccines(input,now));
    assert.equal(view.hasEstimate,false,'Missing records must not imply a dose estimate');
    assert.match(view.description,/no significa que no tenga vacunas/);
    assert.ok(view.historyText);
  }
}
for (const health of [{ill:'yes'}, {ill:'unsure'}, {reaction:'yes'}, {reaction:'unsure'}]) {
  const input = {...base,history:'never',...health};
  const view = resultExperience(input,calculateVaccines(input,now));
  assert.equal(view.healthReview,true);
  assert.equal(view.hasEstimate,false);
  assert.match(view.title,/salud/);
}
const never = {...base,history:'never'};
assert.equal(resultExperience(never,calculateVaccines(never,now)).hasEstimate,true);
assert.match(resultExperience({...base,history:'card'},calculateVaccines({...base,history:'card'},now)).preparation,/foto/);
console.log('Vaccine experience: history, species, health priority and estimates passed.');
