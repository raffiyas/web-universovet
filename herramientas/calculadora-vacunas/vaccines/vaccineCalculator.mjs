import { ageDays, chlamydiaRule, coreRule, felvRule, leptospiraRule, rabiesRule, respiratoryRule } from "./vaccineRules.mjs";
import { calculatePracticalPlan } from './vaccinePlan.mjs';
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
    return { ageDays: days, ageWeeks: days / 7, ageMonths: days / 30.4375, ageYears: days / 365.25, recommendations, alerts, practicalPlan: calculatePracticalPlan(input, now) };
}
