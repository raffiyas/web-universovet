const MS_DAY = 86400000;
export function parseDay(value) {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value))
        return null;
    const day = Date.parse(`${value}T12:00:00Z`);
    return Number.isFinite(day) && new Date(day).toISOString().slice(0, 10) === value ? day : null;
}
export function ageAt(date, birthDate) {
    const d = parseDay(date);
    const b = parseDay(birthDate);
    return d !== null && b !== null && d >= b ? Math.floor((d - b) / MS_DAY) : null;
}
export function ageDays(input, now) {
    const birth = parseDay(input.birthDate);
    if (birth !== null)
        return Math.max(0, Math.floor((now.getTime() - birth) / MS_DAY));
    const estimate = input.approximate;
    if (!estimate || !Number.isFinite(estimate.value) || estimate.value < 0)
        return 0;
    return Math.round(estimate.value * ({ weeks: 7, months: 30.4375, years: 365.25 }[estimate.unit]));
}
export function knownAntigens(dose) {
    // Los nombres comerciales coloquiales no acreditan composición. Solo rabia y antígenos
    // explícitamente confirmados en el carnet/producto se usan como antecedente clínico.
    if (dose.label === "rabies")
        return ["Rabies"];
    return dose.antigens;
}
export function dosesFor(input, antigens, now) {
    return input.history === "card" ? input.doses.filter(d => {
        const day = parseDay(d.date);
        return day !== null && day <= now.getTime() && antigens.every(a => knownAntigens(d).includes(a));
    }).sort((a, b) => a.date.localeCompare(b.date)) : [];
}
export function coreRule(input, days, now) {
    const dog = input.species === "dog";
    const core = dog ? ["CDV", "CAV", "CPV"] : ["FPV", "FHV1", "FCV"];
    const confirmed = dosesFor(input, core, now);
    const last = confirmed.at(-1);
    const after16 = confirmed.find(d => (ageAt(d.date, input.birthDate) ?? (input.approximate ? -1 : -1)) >= 112);
    const after26 = confirmed.find(d => (ageAt(d.date, input.birthDate) ?? -1) >= 182);
    let status = "pending";
    let next = "Revisar el carnet y definir el esquema con un médico veterinario.";
    if (days < 42) {
        status = "soon";
        next = "Inicio habitual a las 6–8 semanas, según producto y evaluación.";
    }
    else if (days < 112) {
        status = confirmed.length || days <= 42 ? "soon" : "pending";
        next = confirmed.length ? "Siguiente dosis orientativa 2–4 semanas después de la anterior; continuar hasta una dosis a las 16 semanas o más." : "Iniciar o verificar la serie ahora; repetir cada 2–4 semanas hasta una dosis a las 16 semanas o más.";
    }
    else if (!last || !after16) {
        status = days >= 182 ? "overdue" : "pending";
        next = "Revisar esquema: se necesita una dosis esencial a las 16 semanas o más; no es posible acreditar esa dosis con los datos ingresados.";
    }
    else if (days < 182 && !after26) {
        status = "soon";
        next = "Considerar control y refuerzo a las 26 semanas o más.";
    }
    else if (!after26 && days < 365) {
        status = "pending";
        next = "Revisar el refuerzo recomendado a las 26 semanas o más.";
    }
    else if (!after26) {
        status = "pending";
        next = "Revisar antecedente de refuerzo a las 26 semanas o más, producto y vigencia; no asumir protección ni atraso solo por el nombre de la vacuna.";
    }
    else {
        status = "current";
        next = "Control veterinario periódico; para vacunas virales esenciales de larga duración, revacunación no más frecuente que cada 3 años según producto y criterio clínico.";
    }
    if (input.history !== "card" && input.history !== "never" && days >= 112) {
        status = "pending";
        next = "Historial no verificable: llevar carnet o iniciar evaluación de esquema de rescate con el veterinario.";
    }
    return { id: "core", title: dog ? "Distemper, adenovirus y parvovirus" : "Panleucopenia, herpesvirus y calicivirus", category: "essential", status, next,
        reason: "Vacunas esenciales (core).", why: "Protegen frente a enfermedades importantes. Las dosis tempranas pueden verse interferidas por anticuerpos maternos, por eso se completa la serie hasta las 16 semanas o más y se revisa un refuerzo a las 26 semanas o más." };
}
export function rabiesRule(input, days, now) {
    const doses = dosesFor(input, ["Rabies"], now);
    const last = doses.at(-1);
    let next = "En Chile la primera dosis corresponde una vez cumplidos 2 meses, respetando la edad mínima de la ficha técnica del producto.";
    if (days >= 61 && !last)
        next = "Consultar para iniciar o verificar vacunación antirrábica; elegir producto autorizado y revisar su edad mínima.";
    if (last)
        next = "Verificar certificado, primer refuerzo al año de edad y luego periodicidad indicada por el fabricante; sin producto no se puede calcular vencimiento.";
    return { id: "rabies", title: "Rabia", category: "legal", status: "legal", next,
        reason: last ? `Última fecha informada: ${last.date}. La vigencia necesita certificado y producto.` : "No se acredita una dosis antirrábica vigente con la información ingresada.",
        why: "El artículo 4 del Decreto 1/2014 exige mantener vacunados a perros y gatos; fija primera dosis después de cumplir 2 meses, primer refuerzo al año de edad y luego la periodicidad del fabricante. La ficha técnica puede exigir una edad mínima mayor." };
}
export function leptospiraRule(input, now) {
    const relevant = input.risks.some(r => ["rodents", "water", "rural", "parks", "travel"].includes(r));
    const doses = dosesFor(input, ["Leptospira"], now);
    const last = doses.at(-1);
    const elapsed = last ? (now.getTime() - parseDay(last.date)) / MS_DAY : null;
    let next = "Evaluar epidemiología local y exposición con el veterinario; la primovacunación suele requerir 2 dosis separadas 2–4 semanas y luego refuerzos generalmente anuales, según producto.";
    if (last && doses.length === 1)
        next = "Confirmar si fue primera dosis; generalmente se completa una segunda a las 2–4 semanas, según producto.";
    if (last && doses.length >= 2)
        next = elapsed >= 365 ? "Revisar posible refuerzo anual pendiente según producto." : "Revisar fecha de refuerzo anual y producto con el carnet.";
    return { id: "leptospira", title: "Leptospira", category: "risk", status: elapsed !== null && elapsed >= 365 ? "overdue" : "risk", next,
        reason: relevant ? "La exposición a roedores, agua, parques o zonas rurales aumenta el interés de esta vacuna." : "También puede existir exposición urbana; revisar riesgo y epidemiología local.",
        why: "La leptospirosis es una zoonosis; se evalúa por separado aunque una vacuna combinada pueda incluirla. El nombre séxtuple u óctuple no confirma sus antígenos." };
}
export function respiratoryRule(input) {
    const relevant = input.risks.some(r => ["parks", "dogs", "grooming", "boarding", "multiDog"].includes(r));
    return { id: "respiratory", title: "Bordetella y complejo respiratorio", category: "risk", status: relevant ? "risk" : "not-indicated",
        next: relevant ? "Conversar sobre prevención respiratoria antes de guardería, hotel o contacto frecuente; la pauta depende de la vacuna y su vía." : "Reevaluar si cambian sus contactos con otros perros.",
        reason: relevant ? "Tiene contactos que pueden facilitar transmisión respiratoria." : "No se identificó exposición frecuente en las respuestas.",
        why: "Es una recomendación basada en riesgo. Existen productos intranasales, orales e inyectables con pautas diferentes; CPiV puede estar en vacunas combinadas." };
}
export function felvRule(input, days) {
    if (input.felv === "positive")
        return { id: "felv", title: "Leucemia felina (FeLV)", category: "risk", status: "not-indicated", next: "Consultar cuidados y seguimiento de un gato FeLV positivo.", reason: "Los gatos FeLV positivos no obtienen beneficio de la vacunación contra FeLV.", why: "La vacuna preventiva no revierte una infección ya establecida." };
    const risk = days < 365 || input.risks.some(r => ["outdoor", "otherCats", "newCats", "shelter"].includes(r));
    return { id: "felv", title: "Leucemia felina (FeLV)", category: "risk", status: risk ? "risk" : "not-indicated",
        next: input.felv !== "negative" ? "Conocer el estado FeLV antes de iniciar vacunación; definir indicación con el veterinario." : risk ? "Revisar serie primaria y refuerzos según edad, riesgo y producto." : "Reevaluar si cambia el estilo de vida.",
        reason: risk ? "Especialmente relevante en gatitos, jóvenes y gatos con contacto exterior o gatos nuevos." : "No se identificó exposición adicional en este adulto de interior.",
        why: "La recomendación depende de edad y exposición. No se debe asumir un refuerzo anual para todos los adultos." };
}
export function chlamydiaRule(input) {
    const risk = input.risks.includes("shelter") || input.risks.includes("newCats");
    return { id: "chlamydia", title: "Chlamydia felis", category: "risk", status: risk ? "risk" : "not-indicated",
        next: risk ? "Evaluar contexto epidemiológico de colectividad con el veterinario." : "No se indica por rutina según estas respuestas.",
        reason: risk ? "Posible exposición en colectividades." : "No hay indicación epidemiológica específica identificada.",
        why: "Es una vacuna basada en riesgo. Una etiqueta de cuádruple felina no acredita que sea mejor que una triple ni identifica por sí sola su composición." };
}
