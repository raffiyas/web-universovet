import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePracticalPlan, clinicDay, addMonths } from '../herramientas/calculadora-vacunas/vaccines/vaccinePlan.mjs';
import { knownAntigens, dosesFor } from '../herramientas/calculadora-vacunas/vaccines/vaccineRules.mjs';
import { getProduct } from '../herramientas/calculadora-vacunas/vaccines/vaccineProducts.mjs';
import { calculateVaccines } from '../herramientas/calculadora-vacunas/vaccines/vaccineCalculator.mjs';

const now = new Date('2026-09-29T15:00:00Z'), DAY = 86400000, today = Date.parse('2026-09-29T12:00:00Z');
const text = ms => new Date(ms).toISOString().slice(0, 10);
const input = (weeks, extra = {}) => ({ species: 'dog', birthDate: text(today - weeks * 7 * DAY), ill: 'no', reaction: 'no', history: 'never', doses: [], risks: [], ...extra });
const dose = (productId, date) => ({ productId, date, label: 'other', antigens: [] });
const plan = i => calculatePracticalPlan(i, now);
const get = (i, id) => plan(i).rows.find(r => r.id === id);
const atAge = (i, weeks) => text(Date.parse(i.birthDate + 'T12:00:00Z') + weeks * 7 * DAY);

test('cachorro 10 semanas: tres Vanguard hasta 16 semanas, una rabia y una B Oral por exposición', () => {
  const i = input(10, { risks: ['boarding'] });
  assert.equal(get(i, 'puppy').quantity, 0);
  assert.equal(get(i, 'polyvalent').quantity, 3);
  assert.deepEqual(get(i, 'polyvalent').dates, ['2026-09-29', '2026-10-20', '2026-11-10']);
  assert.equal(get(i, 'rabies').quantity, 1);
  assert.equal(get(i, 'bordetella').quantity, 1);
  assert.equal(plan(i).rows.some(r => r.id === 'leptospira'), false);
});
test('inicio a 6 semanas: no cerrar a 12 o 15; último Vanguard a 18 semanas con intervalo de ficha', () => {
  const i = input(6), r = get(i, 'polyvalent');
  assert.equal(r.quantity, 5);
  assert.equal(r.dates.at(-1), atAge(i, 18));
  for (let n = 1; n < r.dates.length; n++) assert.equal(Date.parse(r.dates[n]) - Date.parse(r.dates[n - 1]), 21 * DAY);
});
test('a 4 semanas Puppy es opción clínica, polivalente no antes de 6 y B Oral no antes de 8', () => {
  const i = input(4, { risks: ['dogs'] });
  assert.equal(get(i, 'puppy').optional, true);
  assert.equal(get(i, 'polyvalent').dates[0], atAge(i, 6));
  assert.equal(get(i, 'bordetella').dates[0], atAge(i, 8));
});
test('adulto sin vacunas: dos Vanguard y no Puppy', () => {
  const i = input(156);
  assert.equal(get(i, 'polyvalent').quantity, 2);
  assert.equal(get(i, 'puppy').quantity, 0);
});
test('Puppy se normaliza a DP y no confirma adenovirus ni reemplaza dos Vanguard', () => {
  assert.deepEqual(knownAntigens(dose('puppy-dp-plus', '2026-09-01')), ['CDV', 'CPV']);
  const i = input(13, { history: 'card' }); i.doses = [dose('puppy-dp-plus', atAge(i, 10))];
  assert.equal(get(i, 'polyvalent').quantity, 2);
  assert.equal(get(i, 'puppy').quantity, 0);
});
test('una Vanguard válida se descuenta y se respeta intervalo de 21 días', () => {
  const i = input(13, { history: 'card' }); i.doses = [dose('vanguard-5-l4', atAge(i, 12))];
  assert.equal(get(i, 'polyvalent').quantity, 2);
  assert.equal(get(i, 'polyvalent').dates[0], atAge(i, 15));
});
test('serie 13 y 16 semanas completa: cero iniciales, control 26 separado', () => {
  const i = input(17, { history: 'card' }); i.doses = [dose('vanguard-5-l4', atAge(i, 13)), dose('vanguard-5-l4', atAge(i, 16))];
  assert.equal(get(i, 'polyvalent').quantity, 0);
  assert.ok(plan(i).followUps.some(f => f.date === atAge(i, 26)));
});
test('serie documentada y refuerzo anual vencido: una, no reiniciar', () => {
  const i = input(100, { history: 'card' }); i.doses = [dose('vanguard-5-l4', atAge(i, 13)), dose('vanguard-5-l4', atAge(i, 16))];
  assert.equal(get(i, 'polyvalent').quantity, 1);
});
test('dos dosis anuales sin serie primaria documentada no se confirman como serie completa', () => {
  const i = input(156, { history: 'card', doses: [dose('vanguard-5-l4', '2024-09-29'), dose('vanguard-5-l4', '2025-09-29')] });
  assert.equal(get(i, 'polyvalent').quantity, null);
});
test('cambio de Nobivac L2 a Vanguard L4 requiere revisión', () => {
  const i = input(13, { history: 'card' }); i.doses = [dose('nobivac-dappvl2', atAge(i, 10))];
  assert.equal(get(i, 'polyvalent').quantity, null);
  assert.equal(getProduct('nobivac-dappvl2').leptospira.length, 2);
  assert.equal(getProduct('vanguard-5-l4').leptospira.length, 4);
});
test('B Oral es exclusivamente oral y una dosis desde 8 semanas por riesgo', () => {
  assert.equal(getProduct('vanguard-b-oral').route, 'oral');
  assert.deepEqual(getProduct('vanguard-b-oral').antigens, ['Bordetella']);
  assert.equal(get(input(10), 'bordetella').quantity, 0);
  assert.equal(get(input(10, { risks: ['grooming'] }), 'bordetella').quantity, 1);
});
test('B Oral registrada vigente: cero y revisión anual separada', () => {
  const i = input(30, { history: 'card', risks: ['boarding'], doses: [dose('vanguard-b-oral', '2026-09-01')] });
  assert.equal(get(i, 'bordetella').quantity, 0);
  assert.ok(plan(i).followUps.some(f => f.date === '2027-09-01'));
});
test('otra Bordetella no adopta automáticamente la pauta oral', () => {
  const i = input(30, { history: 'card', risks: ['boarding'], doses: [{ date: '2026-09-01', antigens: ['Bordetella'], label: 'kennel' }] });
  assert.equal(get(i, 'bordetella').quantity, null);
});
test('historial desconocido, parcial, o carnet vacío: no prescribir cantidades ni fechas', () => {
  for (const history of ['unknown', 'some', 'card']) {
    const p = plan(input(20, { history }));
    assert.ok(p.rows.every(r => r.quantity === null && !r.dates.length));
  }
});
test('salud o reacción sin descartar: evaluación antes de cantidades', () => {
  for (const extra of [{ ill: 'yes' }, { ill: 'unsure' }, { reaction: 'yes' }, { reaction: 'unsure' }])
    assert.ok(plan(input(20, extra)).rows.every(r => r.quantity === null));
});
test('fecha futura, fecha antes de nacer o composición desconocida bloquea descuento', () => {
  for (const d of [dose('vanguard-5-l4', '2027-01-01'), dose('vanguard-5-l4', '2020-01-01'), { date: '2026-09-01', label: 'sextuple', antigens: [] }])
    assert.ok(plan(input(20, { history: 'card', doses: [d] })).rows.every(r => r.quantity === null));
});
test('mínimo de edad e intervalos cortos en Vanguard requieren revisión', () => {
  const i = input(13, { history: 'card' });
  i.doses = [dose('vanguard-5-l4', atAge(i, 5))]; assert.equal(get(i, 'polyvalent').quantity, null);
  i.doses = [dose('vanguard-5-l4', atAge(i, 11)), dose('vanguard-5-l4', atAge(i, 12))]; assert.equal(get(i, 'polyvalent').quantity, null);
});
test('serie incompleta con intervalo prolongado no se reinicia ni descuenta sin revisión', () => {
  const i = input(20, { history: 'card' }); i.doses = [dose('vanguard-5-l4', atAge(i, 10))];
  assert.equal(get(i, 'polyvalent').quantity, null);
});
test('edad aproximada con historia nunca: estimación explícita, pero sin validar fechas previas', () => {
  const i = input(10, { birthDate: undefined, approximate: { value: 10, unit: 'weeks' } });
  assert.equal(get(i, 'polyvalent').quantity, 3);
  assert.match(plan(i).notes.join(' '), /aproximadas/);
  i.history = 'card'; i.doses = [dose('vanguard-5-l4', '2026-09-01')];
  assert.equal(get(i, 'polyvalent').quantity, null);
});
test('primera rabia se proyecta a 3 meses de calendario, no dos meses legales con producto de 3', () => {
  const i = input(8, { birthDate: '2026-08-01' });
  assert.deepEqual(get(i, 'rabies').dates, ['2026-11-01']);
});
test('Nobivac Rabia del cachorro: primer refuerzo al año de edad aunque ficha sea trienal', () => {
  const i = input(40, { birthDate: '2025-12-01', history: 'card', doses: [dose('nobivac-rabia', '2026-03-01')] });
  assert.equal(get(i, 'rabies').quantity, 0);
  assert.ok(plan(i).followUps.some(f => f.date === '2026-12-01'));
});
test('Nobivac Rabia en adulto tiene revisión a 3 años; Rabguard anual', () => {
  for (const [product, expected] of [['nobivac-rabia', '2029-03-01'], ['rabguard', '2027-03-01']]) {
    const i = input(156, { history: 'card', doses: [dose(product, '2026-03-01')] });
    assert.equal(get(i, 'rabies').quantity, 0);
    assert.ok(plan(i).followUps.some(f => f.date === expected));
  }
});
test('primer refuerzo al año vencido: una dosis para revisión', () => {
  const i = input(60, { birthDate: '2025-08-01', history: 'card', doses: [dose('nobivac-rabia', '2025-11-01')] });
  assert.equal(get(i, 'rabies').quantity, 1);
});
test('Rabisin, rabia sin marca o aplicada antes de tres meses: no inventar vencimiento', () => {
  const i = input(30, { history: 'card' });
  for (const d of [dose('rabisin', '2026-09-01'), { label: 'rabies', date: '2026-09-01', antigens: [] }, dose('rabguard', atAge(i, 8))]) {
    i.doses = [d]; assert.equal(get(i, 'rabies').quantity, null);
  }
});
test('gato no recibe catálogo canino, polivalente o B Oral', () => {
  const i = input(10, { species: 'cat' });
  assert.deepEqual(plan(i).rows.map(r => r.id), ['feline-core', 'rabies']);
  assert.equal(get(i, 'feline-core').quantity, null);
  const bad = dose('vanguard-5-l4', '2026-09-01');
  assert.deepEqual(dosesFor({ ...i, history: 'card', doses: [bad] }, ['CDV'], now), []);
});
test('fechas usan día de Chile aunque UTC ya sea el día siguiente; aniversarios bisiestos', () => {
  assert.equal(clinicDay(new Date('2026-09-30T00:10:00Z')), '2026-09-29');
  assert.equal(text(addMonths(Date.parse('2024-02-29T12:00:00Z'), 12)), '2025-02-28');
});
test('la edad y el calendario coinciden con Chile en madrugada UTC', () => {
  const i = input(10);
  assert.equal(calculateVaccines(i, new Date('2026-09-30T00:10:00Z')).ageDays, 70);
});
test('serie esencial antigua no permanece marcada al día indefinidamente', () => {
  const i = input(312, { history: 'card', doses: [dose('vanguard-5-l4', '2022-09-01')] });
  assert.equal(calculateVaccines(i, now).recommendations.find(r => r.id === 'core').status, 'pending');
});
