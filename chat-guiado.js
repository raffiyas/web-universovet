/* Universo Vet: preguntas frecuentes guiadas. Sin almacenamiento, analítica ni peticiones propias. */
(() => {
  'use strict';

  const DEFAULT_MESSAGE = 'Hola, quisiera agendar una hora para mi mascota';
  const CHAT_TOPICS = {
    horarios: 'Horarios y ubicación',
    servicios: 'Servicios y valores',
    vacunas: 'Vacunas',
    agendar: 'Agendar por WhatsApp',
    consultas: 'Consultas veterinarias',
    tarifasVacunas: 'Precios de vacunas',
    peluqueria: 'Peluquería y baño',
    desparasitacion: 'Desparasitación',
    procedimientos: 'Procedimientos veterinarios',
    otros: 'Otros servicios y planes',
    examenes: 'Exámenes de laboratorio'
  };

  function initGuidedChat() {
    if (document.getElementById('uv-guided-chat')) return;

    // Obtener el destinatario desde el CTA oficial ya publicado. Privacidad usa el mismo respaldo.
    const existingWhatsApp = document.querySelector('.js-whatsapp-cta[href*="wa.me/"]');
    let whatsappBase = 'https://wa.me/56935677904';
    try {
      const url = new URL(existingWhatsApp?.href || whatsappBase);
      if (url.hostname === 'wa.me' && /^\/\d+$/.test(url.pathname)) {
        whatsappBase = url.origin + url.pathname;
      }
    } catch {
      // Se conserva el número oficial publicado en la web.
    }
    function whatsappUrl(message) {
      return whatsappBase + '?text=' + encodeURIComponent(message);
    }

    const root = document.createElement('div');
    root.id = 'uv-guided-chat';
    root.className = 'uv-chat';
    root.innerHTML = `
      <button type="button" class="uv-chat__launcher" id="uv-chat-launcher"
        aria-controls="uv-chat-panel" aria-expanded="false" aria-label="Abrir ayuda de Universo Vet">
        <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8A8.5 8.5 0 0 1 12.5 20a8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 12.5 3H13a8.5 8.5 0 0 1 8 8v.5Z"/>
        </svg>
        <span>¿Te ayudamos?</span>
      </button>

      <section class="uv-chat__panel" id="uv-chat-panel" role="dialog" aria-modal="false"
        aria-labelledby="uv-chat-title" hidden>
        <div class="uv-chat__top">
          <div class="uv-chat__identity"><span class="uv-chat__spark" aria-hidden="true">✦</span>
            <div><strong>Universo Vet</strong><span>Respuestas rápidas · Coquimbo</span></div>
          </div>
          <button type="button" class="uv-chat__close" id="uv-chat-close" aria-label="Cerrar ayuda">×</button>
        </div>

        <div class="uv-chat__content" id="uv-chat-content">
          <h2 id="uv-chat-title" tabindex="-1">¿En qué te podemos ayudar?</h2>
          <p class="uv-chat__lead" id="uv-chat-lead">Elige un tema y te orientamos.</p>
          <div class="uv-chat__topics" id="uv-chat-topics" role="group" aria-label="Temas de ayuda">
            <button type="button" data-uv-topic="horarios"><span>📍</span>Horarios y ubicación<span aria-hidden="true">›</span></button>
            <button type="button" data-uv-topic="servicios"><span>🩺</span>Servicios y valores<span aria-hidden="true">›</span></button>
            <button type="button" data-uv-topic="vacunas"><span>💉</span>Vacunas<span aria-hidden="true">›</span></button>
            <button type="button" data-uv-topic="agendar"><span>💬</span>Agendar por WhatsApp<span aria-hidden="true">›</span></button>
          </div>

          <div class="uv-chat__answer" id="uv-chat-answer" hidden>
            <div data-uv-answer="horarios" hidden>
              <p>¡Te esperamos en <strong>José Joaquín Pérez 3505, Local 14 (2.º piso), Coquimbo</strong>, en Boulevard Terrazas de Coquimbo!</p>
              <p><strong>Lunes a viernes:</strong> 10:00 a 19:00.<br><strong>Sábados:</strong> 10:00 a 14:00.</p>
              <a class="uv-chat__text-link" id="uv-chat-map" href="https://maps.app.goo.gl/6cHy2EJCaqD38Wv9A" target="_blank" rel="noopener noreferrer">📍 Cómo llegar con Google Maps</a>
            </div>
            <div data-uv-answer="servicios" hidden><p>¿Qué servicio necesita tu mascota?</p><div class="uv-chat__topics"><button type="button" data-uv-subtopic="consultas"><span aria-hidden="true">🩺</span>Consultas veterinarias<span aria-hidden="true">›</span></button><button type="button" data-uv-subtopic="tarifasVacunas"><span aria-hidden="true">💉</span>Precios de vacunas<span aria-hidden="true">›</span></button><button type="button" data-uv-subtopic="peluqueria"><span aria-hidden="true">✂️</span>Peluquería y baño<span aria-hidden="true">›</span></button><button type="button" data-uv-subtopic="desparasitacion"><span aria-hidden="true">🛡️</span>Desparasitación<span aria-hidden="true">›</span></button><button type="button" data-uv-subtopic="procedimientos"><span aria-hidden="true">📋</span>Procedimientos veterinarios<span aria-hidden="true">›</span></button><button type="button" data-uv-subtopic="otros"><span aria-hidden="true">🐾</span>Otros servicios y planes<span aria-hidden="true">›</span></button><button type="button" data-uv-subtopic="examenes"><span aria-hidden="true">🔬</span>Exámenes de laboratorio<span aria-hidden="true">›</span></button></div></div>
<div data-uv-answer="consultas" hidden><dl class="uv-chat__prices"><div><dt>Consulta general</dt><dd>$15.000</dd></div><div><dt>Control veterinario</dt><dd>$10.000</dd></div><div><dt>Teleconsulta</dt><dd>$20.000</dd></div><div><dt>Cardiología o respiratoria</dt><dd>Consultar</dd></div></dl></div>
<div data-uv-answer="tarifasVacunas" hidden><dl class="uv-chat__prices"><div><dt>Puppy DP</dt><dd>$22.500</dd></div><div><dt>Polivalente (séxtuple u óctuple)</dt><dd>$18.000</dd></div><div><dt>Tos de las perreras (KC)</dt><dd>$22.500</dd></div><div><dt>Antirrábica (perros y gatos)</dt><dd>$18.000</dd></div><div><dt>Triple felina</dt><dd>$20.000</dd></div><div><dt>Leucemia felina</dt><dd>$22.000</dd></div></dl><p>El médico veterinario determinará qué vacuna corresponde según edad, antecedentes y salud.</p></div>
<div data-uv-answer="peluqueria" hidden><dl class="uv-chat__prices"><div><dt>Baño XS / S / M</dt><dd>$15.000 / $18.000 / $22.000</dd></div><div><dt>Baño G / XG / XXG</dt><dd>$25.000 / $30.000 / $35.000</dd></div><div><dt>Peluquería XS / S / M</dt><dd>$25.000 / $30.000 / $35.000</dd></div><div><dt>Peluquería G / XG / XXG</dt><dd>$40.000 / $45.000 / $50.000</dd></div><div><dt>Corte de uñas simple</dt><dd>$10.000</dd></div><div><dt>Corte de uñas complejo</dt><dd>$15.000</dd></div><div><dt>Corte de uñas en consulta</dt><dd>$5.000</dd></div></dl><p>El precio final depende del tamaño y las condiciones del pelaje.</p></div>
<div data-uv-answer="desparasitacion" hidden><dl class="uv-chat__prices"><div><dt>0–2,5 kg</dt><dd>$1.500</dd></div><div><dt>2,5–5 kg</dt><dd>$2.000</dd></div><div><dt>5–10 kg</dt><dd>$2.500</dd></div><div><dt>10–15 kg</dt><dd>$3.000</dd></div><div><dt>15–20 kg</dt><dd>$3.500</dd></div><div><dt>20–25 kg</dt><dd>$4.000</dd></div><div><dt>25–30 kg</dt><dd>$4.500</dd></div><div><dt>30–35 kg</dt><dd>Consultar</dd></div><div><dt>35–40 kg</dt><dd>$5.000</dd></div><div><dt>40–45 kg</dt><dd>$5.500</dd></div><div><dt>45–50 kg</dt><dd>$6.000</dd></div></dl><p>Consulta con recepción para confirmar el tramo y producto adecuado.</p></div>
<div data-uv-answer="procedimientos" hidden><dl class="uv-chat__prices"><div><dt>Castración felina</dt><dd>Consultar</dd></div><div><dt>Limpieza dental</dt><dd>Consultar</dd></div><div><dt>Curaciones</dt><dd>Consultar</dd></div></dl></div>
<div data-uv-answer="otros" hidden><dl class="uv-chat__prices"><div><dt>Implantación de microchip</dt><dd>$18.000</dd></div><div><dt>Certificado veterinario de viaje</dt><dd>$15.000</dd></div><div><dt>Programa Cachorro</dt><dd>Desde $95.000</dd></div><div><dt>Pet shop</dt><dd>Consultar</dd></div></dl><a class="uv-chat__text-link" href="/planes#programa-cachorro">Conocer el Programa Cachorro</a></div>
<div data-uv-answer="examenes" hidden><p>Selecciona los exámenes sanguíneos indicados para tu mascota. Sumaremos una única toma de muestra de $5.000 si se realizan en la misma extracción.</p><fieldset class="uv-chat__exam"><legend>Exámenes sanguíneos</legend><label><input type="checkbox" data-exam-price="16990" data-exam-id="0"><span>Hemograma</span><strong>$16.990</strong></label><label><input type="checkbox" data-exam-price="26990" data-exam-id="1"><span>Perfil bioquímico</span><strong>$26.990</strong></label><label><input type="checkbox" data-exam-price="18990" data-exam-id="2"><span>Perfil renal</span><strong>$18.990</strong></label><label><input type="checkbox" data-exam-price="24990" data-exam-id="3"><span>Perfil hepático</span><strong>$24.990</strong></label><label><input type="checkbox" data-exam-price="34990" data-exam-id="4"><span>Hemograma + perfil bioquímico</span><strong>$34.990</strong></label><label><input type="checkbox" data-exam-price="24990" data-exam-id="5"><span>Hemograma + perfil renal</span><strong>$24.990</strong></label><label><input type="checkbox" data-exam-price="28990" data-exam-id="6"><span>Hemograma + perfil hepático</span><strong>$28.990</strong></label><label><input type="checkbox" data-exam-price="31690" data-exam-id="7"><span>Test rápido FeLV/FIV</span><strong>$31.690</strong></label></fieldset><div class="uv-chat__quote" aria-live="polite"><p>Exámenes: <strong id="uv-exam-subtotal">$0</strong></p><p>Toma de muestra: <strong id="uv-exam-fee">$0</strong></p><p>Total estimado: <strong id="uv-exam-total">$0</strong></p></div><p class="uv-chat__hint">Los paquetes ya incluyen sus exámenes: evita seleccionarlos junto a sus componentes. No incluye consulta veterinaria.</p><h3>Otros exámenes frecuentes</h3><dl class="uv-chat__prices"><div><dt>Análisis de orina y sedimento</dt><dd>$23.990</dd></div><div><dt>Coproparasitario</dt><dd>$26.990</dd></div><div><dt>Test rápido Giardia</dt><dd>$24.990</dd></div><div><dt>Test rápido parvovirus</dt><dd>$23.990</dd></div><div><dt>Test rápido distemper</dt><dd>$23.990</dd></div></dl><p>Para muestras de orina, fecales u otras, confirma el método de obtención y su eventual costo con recepción.</p></div>
            <div data-uv-answer="vacunas" hidden>
              <p>Las vacunas ayudan a prevenir enfermedades. El esquema depende de la especie, edad, antecedentes y exposición de cada mascota.</p>
              <p>Nuestra calculadora gratuita te entrega una <strong>orientación inicial</strong>, pero no reemplaza la evaluación veterinaria.</p>
              <button type="button" class="uv-chat__back" data-uv-subtopic="tarifasVacunas">Consultar precios de vacunas</button>
              <a class="uv-chat__text-link" href="/herramientas/calculadora-vacunas">Abrir calculadora de vacunas</a>
              <p>¿Tienes dudas sobre vacunas específicas o tu mascota presenta síntomas? Mejor conversemos directamente con recepción para coordinar su evaluación.</p>
            </div>
            <div data-uv-answer="agendar" hidden>
              <p>¡Claro! Puedes personalizar este mensaje antes de abrir WhatsApp. Tú decides si lo envías.</p>
              <label for="uv-chat-message">Mensaje para recepción</label>
              <textarea id="uv-chat-message" rows="3" maxlength="500" spellcheck="true">Hola, quisiera agendar una hora para mi mascota</textarea>
              <a class="uv-chat__send" id="uv-chat-send" href="#" target="_blank" rel="noopener noreferrer">Continuar a WhatsApp</a>
              <p class="uv-chat__hint">No guardamos este mensaje en el sitio. Podrás revisarlo también en WhatsApp antes de enviarlo.</p>
            </div>
          </div>
        </div>

        <div class="uv-chat__footer">
          <button type="button" class="uv-chat__back" id="uv-chat-back" hidden>← Volver al menú</button>
          <a class="uv-chat__reception" id="uv-chat-reception" target="_blank" rel="noopener noreferrer">Hablar con recepción</a>
        </div>
      </section>`;
    document.body.append(root);

    const launcher = root.querySelector('#uv-chat-launcher');
    const panel = root.querySelector('#uv-chat-panel');
    const closeButton = root.querySelector('#uv-chat-close');
    const heading = root.querySelector('#uv-chat-title');
    const lead = root.querySelector('#uv-chat-lead');
    const topics = root.querySelector('#uv-chat-topics');
    const answers = root.querySelector('#uv-chat-answer');
    const back = root.querySelector('#uv-chat-back');
    const reception = root.querySelector('#uv-chat-reception');
    const message = root.querySelector('#uv-chat-message');
    const send = root.querySelector('#uv-chat-send');
    const map = root.querySelector('#uv-chat-map');

    // La URL del mapa procede del enlace de ubicación publicado en la portada.
    const publishedMap = document.querySelector('#ubicacion .location__block a[href*="maps"]');
    if (publishedMap) map.href = publishedMap.href;

    reception.href = whatsappUrl('Hola, quisiera hacer una consulta a Universo Vet');

    function updateBookingLink() {
      const value = message.value.trim();
      send.toggleAttribute('aria-disabled', !value);
      if (value) send.href = whatsappUrl(value);
      else send.removeAttribute('href');
    }
    message.addEventListener('input', updateBookingLink);
    send.addEventListener('click', (event) => {
      if (!message.value.trim()) event.preventDefault();
    });
    updateBookingLink();

    let currentTopic = null;
    let subtopicParent = 'servicios';
    const checks = Array.from(root.querySelectorAll('[data-exam-price]'));
    const formatCLP = value => '$' + new Intl.NumberFormat('es-CL').format(value);
    function updateQuote(event) {
      // Los paquetes no se suman junto a sus componentes.
      const groups = [[4,0,1],[5,0,2],[6,0,3]];
      if (event?.target.checked) {
        const id = Number(event.target.dataset.examId);
        for (const [pack,...parts] of groups) {
          if (id === pack) parts.forEach(i => { checks[i].checked = false; });
          else if (parts.includes(id)) checks[pack].checked = false;
        }
        if (id >= 4 && id <= 6) [4,5,6].filter(i=>i!==id).forEach(i=>{ checks[i].checked=false; });
      }
      const subtotal = checks.filter(x=>x.checked).reduce((s,x)=>s+Number(x.dataset.examPrice),0);
      const fee = subtotal ? 5000 : 0;
      root.querySelector('#uv-exam-subtotal').textContent = formatCLP(subtotal);
      root.querySelector('#uv-exam-fee').textContent = formatCLP(fee);
      root.querySelector('#uv-exam-total').textContent = formatCLP(subtotal+fee);
    }
    checks.forEach(x=>x.addEventListener('change',updateQuote));
    function showMenu() {
      currentTopic = null;
      heading.textContent = '¿En qué te podemos ayudar?';
      lead.hidden = false;
      topics.hidden = false;
      answers.hidden = true;
      back.hidden = true;
      root.querySelectorAll('[data-uv-answer]').forEach((item) => { item.hidden = true; });
      root.querySelector('#uv-chat-content').scrollTop = 0;
      heading.focus({ preventScroll: true });
    }

    function showTopic(topic) {
      if (!Object.hasOwn(CHAT_TOPICS, topic)) return;
      currentTopic = topic;
      back.textContent = ["consultas","tarifasVacunas","peluqueria","desparasitacion","procedimientos","otros","examenes"].includes(topic) ? '← Volver' : '← Volver al menú';
      heading.textContent = CHAT_TOPICS[topic];
      lead.hidden = true;
      topics.hidden = true;
      answers.hidden = false;
      back.hidden = false;
      root.querySelectorAll('[data-uv-answer]').forEach((item) => {
        item.hidden = item.getAttribute('data-uv-answer') !== topic;
      });
      root.querySelector('#uv-chat-content').scrollTop = 0;
      heading.focus({ preventScroll: true });
    }

    function closeChat() {
      if (panel.hidden) return;
      checks.forEach(x=>{ x.checked=false; });
      updateQuote();
      message.value = DEFAULT_MESSAGE;
      updateBookingLink();
      panel.hidden = true;
      launcher.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('uv-chat-is-open');
      launcher.focus({ preventScroll: true });
    }

    function openChat() {
      panel.hidden = false;
      launcher.setAttribute('aria-expanded', 'true');
      document.body.classList.add('uv-chat-is-open');
      showMenu();
    }

    launcher.addEventListener('click', () => {
      if (panel.hidden) openChat();
      else closeChat();
    });
    closeButton.addEventListener('click', closeChat);
    back.addEventListener('click', () => {
      if (["consultas","tarifasVacunas","peluqueria","desparasitacion","procedimientos","otros","examenes"].includes(currentTopic)) showTopic(subtopicParent);
      else showMenu();
    });
    answers.addEventListener('click', event => {
      const button = event.target.closest('[data-uv-subtopic]');
      if (button) {
        subtopicParent = currentTopic === 'vacunas' ? 'vacunas' : 'servicios';
        showTopic(button.dataset.uvSubtopic);
      }
    });
    topics.addEventListener('click', (event) => {
      const button = event.target.closest('[data-uv-topic]');
      if (button) showTopic(button.dataset.uvTopic);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !panel.hidden) {
        event.preventDefault();
        closeChat();
      }
    });

    // La solicitud de consentimiento conserva prioridad. En pantallas estrechas
    // desplazamos el chat por encima del aviso, sin mover el documento.
    const cookieBanner = document.getElementById('estadisticas');
    function updateCookieClearance() {
      let clearance = 0;
      if (cookieBanner && !cookieBanner.hidden && window.innerWidth <= 900) {
        const rect = cookieBanner.getBoundingClientRect();
        if (rect.height > 0) clearance = Math.ceil(window.innerHeight - rect.top) + 8;
      }
      root.style.setProperty('--uv-chat-cookie-clearance', clearance + 'px');
      document.body.style.setProperty('--uv-chat-cookie-clearance', clearance + 'px');
    }
    updateCookieClearance();
    window.addEventListener('resize', updateCookieClearance, { passive: true });
    if (cookieBanner && 'MutationObserver' in window) {
      const observer = new MutationObserver(updateCookieClearance);
      observer.observe(cookieBanner, { attributes: true, attributeFilter: ['hidden', 'style', 'class'] });
    }

    // Para inspección y QA sin exponer datos personales.
    root.dataset.ready = 'true';
    document.body.classList.add('uv-chat-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGuidedChat, { once: true });
  } else {
    initGuidedChat();
  }
})();
