import { ageDays, chlamydiaRule, coreRule, felvRule, leptospiraRule, rabiesRule, respiratoryRule } from "./vaccineRules.mjs";
import { calculatePracticalPlan } from './vaccinePlan.mjs';
// Group the public explanation by the vaccines offered, preserving antigen rules.
export function publicRecommendations(recommendations, species) {
    if (species !== 'dog') return recommendations;
    const lepto = recommendations.find(r => r.id === 'leptospira');
    return recommendations.filter(r => r.id !== 'leptospira').map(r => r.id !== 'core' ? r : {
        ...r,
        title: 'Polivalente · protección y componentes',
        status: lepto?.status === 'overdue' ? 'overdue' : r.status,
        reason: 'Vanguard Plus 5 L4 incluye protección frente a distemper, adenovirus, parvovirus, parainfluenza y leptospirosis. Leptospira no suma una aplicación adicional.',
        next: `${r.next} Para Leptospira incluida en la polivalente: ${lepto.next}`,
        why: `${r.why} ${lepto.reason} La cobertura de Leptospira y sus refuerzos se revisan dentro de la polivalente, según producto y carnet; L2 y L4 tienen componentes distintos.`
    });
}
export function calculateVaccines(input, now = new Date()) {
    const days = ageDays(input, now);
    const recommendations = [coreRule(input, days, now), rabiesRule(input, days, now)];
    if (input.species === "dog")
        recommendations.push(leptospiraRule(input, now), respiratoryRule(input));
    else
        recommendations.push(felvRule(input, days), chlamydiaRule(input));
    const alerts = [];
    if (input.ill !== "no")
        alerts.push("Si está enferma, bajo tratamiento o hay dudas sobre su salud, un médico veterinario debe evaluarla antes de vacunar.");
    if (input.reaction === "yes")
        alerts.push("Ante una reacción vacunal importante previa, consulta al veterinario antes de la próxima dosis y lleva el antecedente.");
    if (input.history !== "card")
        alerts.push("Sin carnet verificable no podemos confirmar antígenos administrados ni vigencia de vacunas.");
    if (!input.birthDate)
        alerts.push("La edad aproximada no permite comprobar la edad exacta a la que se aplicaron dosis anteriores.");
    return { ageDays: days, ageWeeks: days / 7, ageMonths: days / 30.4375, ageYears: days / 365.25, recommendations, publicRecommendations: publicRecommendations(recommendations, input.species), alerts, practicalPlan: calculatePracticalPlan(input, now) };
}
