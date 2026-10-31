// Presentation only: dose counts, dates and clinical recommendations remain in vaccines/.
export function resultExperience(input, result) {
  const healthReview = input.ill !== 'no' || input.reaction !== 'no';
  const hasEstimate = result.practicalPlan.rows.some(row => row.quantity !== null);
  const hasHistoricalRecord = (input.pendingCards||[]).some(v=>Boolean(v.historicalId));
  const historyText = {
    card: 'Tengo su carnet.', some: 'Recuerdo vacunas anteriores, sin carnet para confirmarlas.',
    never: 'Según mis antecedentes, nunca ha sido vacunada.', unknown: 'No conozco su historial de vacunas.'
  }[input.history];
  const title = healthReview ? 'Primero, revisemos su salud' : hasEstimate ? 'Ya tienes una orientación para su próximo paso' : hasHistoricalRecord ? 'Encontramos antecedentes de vacunación' : 'Revisemos sus vacunas contigo';
  const description = healthReview
    ? 'Por lo que nos cuentas de su salud o reacciones anteriores, necesita una evaluación veterinaria antes de definir sus próximas vacunas.'
    : hasEstimate
      ? 'Estas son las vacunas y fechas orientativas para revisar. Las confirmaremos en consulta según su carné y estado de salud.'
      : hasHistoricalRecord
        ? 'Reconocimos vacunas anteriores en su carné. Si las últimas aplicaciones son antiguas, puede necesitar actualizar su esquema. Revisemos qué refuerzos corresponden según su edad y exposición.'
        : 'Con los antecedentes disponibles, todavía no podemos confirmar cuáles están al día. Revisemos su historial antes de definir nuevas dosis.';
  const preparation = input.history === 'card'
    ? 'Ten su carné a mano para confirmar las dosis y fechas.'
    : input.history === 'never'
      ? 'Te ayudamos a coordinar una evaluación para definir cómo iniciar su vacunación.'
      : 'El siguiente paso es revisar su carné o historial en consulta.';
  return { healthReview, hasEstimate, hasHistoricalRecord, title, description, preparation, historyText };
}
