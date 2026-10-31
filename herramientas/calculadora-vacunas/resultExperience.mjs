// Presentation only: dose counts, dates and clinical recommendations remain in vaccines/.
export function resultExperience(input, result) {
  const healthReview = input.ill !== 'no' || input.reaction !== 'no';
  const hasEstimate = result.practicalPlan.rows.some(row => row.quantity !== null);
  const historyText = {
    card: 'Tengo su carnet.', some: 'Recuerdo vacunas anteriores, sin carnet para confirmarlas.',
    never: 'Según mis antecedentes, nunca ha sido vacunada.', unknown: 'No conozco su historial de vacunas.'
  }[input.history];
  const title = healthReview ? 'Primero, revisemos su salud' : hasEstimate ? 'Ya tienes una orientación para su próximo paso' : 'Revisemos sus vacunas contigo';
  const description = healthReview
    ? 'Por lo que nos cuentas de su salud o reacciones anteriores, necesita una evaluación veterinaria antes de definir sus próximas vacunas.'
    : hasEstimate
      ? 'Más abajo puedes revisar las dosis y fechas estimadas. En consulta confirmamos qué necesita según su carnet y estado de salud.'
      : 'Todavía no podemos confirmar qué vacunas tiene al día ni cuántas necesita. Esto no significa que no tenga vacunas: revisemos sus antecedentes.';
  const preparation = input.history === 'card'
    ? 'Ten su carnet a mano. Puedes adjuntar una foto en la conversación de WhatsApp.'
    : input.history === 'never'
      ? 'Te ayudamos a coordinar una evaluación para definir cómo iniciar su vacunación.'
      : '¿No tienes su carnet? Cuéntanos lo que recuerdas; te ayudamos a definir cómo seguir.';
  return { healthReview, hasEstimate, title, description, preparation, historyText };
}
