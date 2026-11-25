/* Universo Vet: preguntas frecuentes guiadas. Sin almacenamiento, analítica ni peticiones propias. */
(() => {
  'use strict';

  const DEFAULT_MESSAGE = 'Hola, quisiera agendar una hora para mi mascota';
  const CHAT_TOPICS = {
    horarios: 'Horarios y ubicación',
    servicios: 'Servicios y valores',
    vacunas: 'Vacunas',
    agendar: 'Agendar por WhatsApp'
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
            <div data-uv-answer="servicios" hidden>
              <p>En Universo Vet ofrecemos <strong>consultas veterinarias, vacunas, desparasitación, peluquería y baño, corte de uñas y pet shop</strong>.</p>
              <p>En nuestra web está publicado el <strong>Programa Cachorro desde $95.000</strong>. Los valores individuales de los demás servicios se confirman por WhatsApp, según lo que necesite tu mascota.</p>
              <a class="uv-chat__text-link" href="/planes#programa-cachorro">Conocer el Programa Cachorro</a>
            </div>
            <div data-uv-answer="vacunas" hidden>
              <p>Las vacunas ayudan a prevenir enfermedades. El esquema depende de la especie, edad, antecedentes y exposición de cada mascota.</p>
              <p>Nuestra calculadora gratuita te entrega una <strong>orientación inicial</strong>, pero no reemplaza la evaluación veterinaria.</p>
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

    function showMenu() {
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
    back.addEventListener('click', showMenu);
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
    }
    updateCookieClearance();
    window.addEventListener('resize', updateCookieClearance, { passive: true });
    if (cookieBanner && 'MutationObserver' in window) {
      const observer = new MutationObserver(updateCookieClearance);
      observer.observe(cookieBanner, { attributes: true, attributeFilter: ['hidden', 'style', 'class'] });
    }

    // Para inspección y QA sin exponer datos personales.
    root.dataset.ready = 'true';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGuidedChat, { once: true });
  } else {
    initGuidedChat();
  }
})();
