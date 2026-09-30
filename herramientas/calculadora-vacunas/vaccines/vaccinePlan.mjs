import { ageDays, ageAt, knownAntigens, parseDay, clinicDay } from './vaccineRules.mjs';
import { clinicProducts, getProduct } from './vaccineProducts.mjs';

const DAY = 86400000;
const dayText = ms => new Date(ms).toISOString().slice(0, 10);
export { clinicDay };
// Calendar anniversaries are clamped for Feb 29 / end-of-month births.
export function addMonths(day, months) {
  const date = new Date(day);
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1, 12));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(date.getUTCDate(), last));
  return target.getTime();
}
const row = (id, title, quantity, reason, dates = [], extra = {}) => ({ id, title, quantity, reason, dates: dates.map(dayText), ...extra });
const review = (id, title, reason) => row(id, title, null, reason);
const validDoses = (input, today) => input.history === 'card' ? (input.doses || []).filter(d => {
  const date = parseDay(d.date), product = getProduct(d.productId);
  return date !== null && date <= today && (!input.birthDate || ageAt(d.date, input.birthDate) !== null) && (!product || product.species.includes(input.species));
}).sort((a, b) => a.date.localeCompare(b.date)) : [];

function polyvalentPlan(input, doses, today, birth, days, followUps) {
  const product = getProduct(clinicProducts.polyvalent);
  const title = `Polivalente · ${product.name}`;
  const history = doses.filter(d => knownAntigens(d).some(a => ['CDV', 'CAV', 'CPV', 'Leptospira'].includes(a)));
  const full = history.filter(d => d.productId === product.id);
  if (history.some(d => !getProduct(d.productId) || !['puppy', 'polyvalent'].includes(getProduct(d.productId).group)))
    return review('polyvalent', title, 'Confirmar producto y composición del carnet antes de descontar dosis.');
  if (history.some(d => getProduct(d.productId)?.group === 'polyvalent' && d.productId !== product.id))
    return review('polyvalent', title, 'Hay otra polivalente registrada. Revisar el cambio de producto: L2 y L4 tienen coberturas distintas de Leptospira.');
  if (full.length && birth === null)
    return review('polyvalent', title, 'La edad aproximada no permite validar la edad de aplicación de las dosis del carnet.');
  if (history.some(d => ageAt(d.date, input.birthDate) < getProduct(d.productId).minimumAgeWeeks * 7) || full.some((d, i) => i && parseDay(d.date) - parseDay(full[i - 1].date) < 21 * DAY))
    return review('polyvalent', title, 'Revisar edades o intervalos de aplicación antes de calcular cuántas dosis faltan.');
  const firstAge = full.length ? ageAt(full[0].date, input.birthDate) : Math.max(days, 42);
  const minimum = firstAge < 63 ? product.earlyPrimaryDoses : product.primaryDoses;
  const last = full.at(-1);
  // An annual dose cannot be counted as the second dose of a documented primary series.
  let chain = [];
  let finished = false;
  for (const dose of full) {
    if (chain.length && parseDay(dose.date) - parseDay(chain.at(-1).date) > 28 * DAY) chain = [];
    chain.push(dose);
    const needed = ageAt(chain[0].date, input.birthDate) < 63 ? product.earlyPrimaryDoses : product.primaryDoses;
    if (chain.length >= needed && ageAt(dose.date, input.birthDate) >= 112) finished = true;
  }
  if (finished) {
    const annual = addMonths(parseDay(last.date), 12);
    if (days < 365 && !full.some(d => ageAt(d.date, input.birthDate) >= 182))
      followUps.push({ date: dayText(Math.max(today, birth + 182 * DAY)), text: 'Control desde las 26 semanas: evaluar serología o refuerzo esencial con el veterinario; no está incluido en el conteo de la serie inicial.' });
    if (annual > today) {
      followUps.push({ date: dayText(annual), text: 'Revisar refuerzo de Vanguard Plus 5 L4 según ficha, riesgo y carnet.' });
      return row('polyvalent', title, 0, 'Serie inicial registrada. Leptospira ya está incluida en esta polivalente; no se suma como vacuna separada.');
    }
    return row('polyvalent', title, 1, 'Revisar refuerzo anual pendiente del producto combinado; la vigencia de cada componente se evalúa por separado.', [today]);
  }
  if (last && (today - parseDay(last.date) > 28 * DAY || full.some((d, i) => i && parseDay(d.date) - parseDay(full[i - 1].date) > 28 * DAY)))
    return review('polyvalent', title, 'La serie quedó incompleta y el intervalo se prolongó. El veterinario debe definir cómo continuar; no se reinicia automáticamente.');
  const dates = [];
  let next = Math.max(today, today + Math.max(0, 42 - days) * DAY);
  const previous = history.at(-1);
  if (previous) next = Math.max(next, parseDay(previous.date) + product.intervalDays * DAY);
  let count = full.length;
  const ageOn = date => days + (date - today) / DAY;
  // Keep the labelled 21-day interval; do not terminate before the WSAVA 16+ week endpoint.
  // Additional puppy doses are estimates for clinical review, not a product-label requirement.
  while (count < minimum || (dates.length ? ageOn(dates.at(-1)) : last ? ageAt(last.date, input.birthDate) : -1) < 112) {
    dates.push(next); count++; next += product.intervalDays * DAY;
  }
  if (days < 182 && dates.length)
    followUps.push({ date: dayText(Math.max(today + Math.max(0, 182 - days) * DAY, dates.at(-1) + 28 * DAY)), text: 'Control desde las 26 semanas: evaluar serología o refuerzo esencial. Se muestra separado de las dosis de la serie inicial.' });
  return row('polyvalent', title, dates.length, 'Estimación a intervalos de 3 semanas. La ficha exige 2 dosis (3 si comienza antes de 9 semanas); se proyecta además el cierre esencial a las 16 semanas o más. El veterinario puede ajustar el número y el producto. Incluye Leptospira, sin sumarla aparte.', dates);
}

function rabiesPlan(input, doses, today, birth, days, followUps) {
  const title = 'Antirrábica';
  const history = doses.filter(d => knownAntigens(d).includes('Rabies'));
  if (!history.length) {
    const eligible = birth !== null ? addMonths(birth, 3) : today + Math.max(0, 3 * 30.4375 - days) * DAY;
    return row('rabies', title, 1, 'Primera dosis orientativa con Nobivac Rabia o Rabguard desde los 3 meses, respetando ficha y normativa chilena. El producto se elige en consulta.', [Math.max(today, eligible)]);
  }
  const last = history.at(-1), product = getProduct(last.productId);
  if (!product?.boosterYears || birth === null)
    return review('rabies', title, 'Verificar certificado, producto, edad y fecha de refuerzo. No se calcula vigencia sin una pauta confirmada.');
  if (history.some(d => !getProduct(d.productId)?.minimumAgeMonths || parseDay(d.date) < addMonths(birth, getProduct(d.productId).minimumAgeMonths)))
    return review('rabies', title, 'Revisar una dosis aplicada antes de la edad mínima o con pauta aún sin confirmar.');
  const yearOld = addMonths(birth, 12);
  const hasAgeOneDose = history.some(d => parseDay(d.date) >= yearOld);
  // Chile requires the first booster at one year of age, even for a 3-year product.
  const due = !hasAgeOneDose && parseDay(last.date) < yearOld ? yearOld : addMonths(parseDay(last.date), product.boosterYears * 12);
  if (due > today) {
    followUps.push({ date: dayText(due), text: !hasAgeOneDose && parseDay(last.date) < yearOld ? 'Primer refuerzo antirrábico al año de edad, según normativa chilena; confirmar con certificado.' : `Próximo refuerzo antirrábico según ${product.name}; confirmar con certificado.` });
    return row('rabies', title, 0, 'No se proyecta una dosis pendiente ahora según los datos del carnet. La vigencia legal requiere certificado veterinario.');
  }
  return row('rabies', title, 1, 'Revisar refuerzo antirrábico pendiente con el certificado y la ficha del producto.', [today]);
}

function bordetellaPlan(input, doses, today, days, followUps) {
  const product = getProduct(clinicProducts.bordetella), title = `Bordetella · ${product.name}`;
  const risk = (input.risks || []).some(r => ['parks', 'dogs', 'grooming', 'boarding', 'multiDog'].includes(r));
  if (!risk) return row('bordetella', title, 0, 'No se identificó exposición frecuente; reevaluar si cambia su estilo de vida.');
  const history = doses.filter(d => knownAntigens(d).includes('Bordetella'));
  if (history.some(d => d.productId !== product.id))
    return review('bordetella', title, 'Confirmar la vacuna respiratoria previa y su vía antes de descontar dosis.');
  const last = history.at(-1);
  if (last && (!input.birthDate || ageAt(last.date, input.birthDate) < 56))
    return review('bordetella', title, 'Confirmar edad de aplicación: Vanguard B Oral se usa desde las 8 semanas.');
  const due = last ? addMonths(parseDay(last.date), 12) : today + Math.max(0, 56 - days) * DAY;
  if (last && due > today) {
    followUps.push({ date: dayText(due), text: 'Reevaluar exposición y revacunación anual de Vanguard B Oral.' });
    return row('bordetella', title, 0, 'Dosis registrada dentro del intervalo anual de la ficha; reevaluar exposición.');
  }
  return row('bordetella', title, 1, 'Una dosis por vía oral desde las 8 semanas, si el veterinario confirma la indicación por exposición.', [Math.max(today, due)]);
}

export function calculatePracticalPlan(input, now = new Date()) {
  const today = parseDay(clinicDay(now)), birth = parseDay(input.birthDate);
  const days = birth !== null ? (today - birth) / DAY : ageDays(input, now);
  const followUps = [], notes = [
    'Las cantidades corresponden a las próximas dosis proyectadas. Los controles y refuerzos posteriores aparecen separados.',
    'Las fechas son orientativas desde hoy. Coincidir en una fecha no confirma que puedan administrarse juntas; el veterinario define las visitas y compatibilidad.'
  ];
  if (birth === null) notes.push('Con edad aproximada, las fechas también son aproximadas.');
  const doses = validDoses(input, today);
  const unsafe = input.ill !== 'no' || input.reaction !== 'no';
  const uncertain = !['card', 'never'].includes(input.history) || (input.history === 'card' && !doses.length);
  const malformed = input.history === 'card' && (doses.length !== (input.doses || []).length || doses.some(d => !knownAntigens(d).length));
  const blocker = unsafe ? 'Evaluación veterinaria previa por salud o antecedente de reacción. Las cantidades y fechas se definen después del examen.' : uncertain || malformed ? 'Completar o verificar el carnet antes de calcular cantidades y fechas; no se interpreta historial desconocido como ausencia de vacunas.' : null;
  let rows;
  if (input.species === 'dog') {
    if (blocker) {
      rows = [['puppy', 'Puppy · Nobivac Puppy DP Plus'], ['polyvalent', 'Polivalente · Vanguard Plus 5 L4'], ['rabies', 'Antirrábica'], ['bordetella', 'Bordetella · Vanguard B Oral']].map(([id, title]) => review(id, title, blocker));
    } else {
      const puppyGiven = doses.some(d => d.productId === 'puppy-dp-plus');
      const puppy = days >= 28 && days < 42 && !doses.length ? row('puppy', 'Puppy · Nobivac Puppy DP Plus', 1, 'Opción de inicio temprano desde las 4 semanas, solo si el veterinario confirma necesidad y riesgo. No reemplaza la serie polivalente.', [], { optional: true }) : row('puppy', 'Puppy · Nobivac Puppy DP Plus', 0, puppyGiven ? 'Puppy ya está registrada; sus componentes no reemplazan la cobertura completa de una polivalente.' : 'No se añade Puppy de rutina cuando puede iniciarse la polivalente; el veterinario puede ajustar el inicio temprano.');
      rows = [puppy, polyvalentPlan(input, doses, today, birth, days, followUps), rabiesPlan(input, doses, today, birth, days, followUps), bordetellaPlan(input, doses, today, days, followUps)];
    }
  } else {
    rows = [review('feline-core', 'Triple felina', blocker || 'Para contar dosis necesitamos confirmar el producto felino que se utilizará.'), blocker ? review('rabies', 'Antirrábica', blocker) : rabiesPlan(input, doses, today, birth, days, followUps)];
  }
  if (rows.some(r => r.quantity === null)) notes.push('“Por definir” no equivale a cero dosis.');
  return { rows, followUps: followUps.sort((a, b) => a.date.localeCompare(b.date)), notes };
}
