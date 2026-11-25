(() => {
  const key = 'uv-estadisticas-v1';
  const id = 'G-JEDGQPSB9F';
  const panel = document.querySelector('#estadisticas');
  const manage = document.querySelector('[data-preferencias]');
  let choice;
  try { choice = localStorage.getItem(key); } catch {}
  function clearCookies() {
    for (const name of ['_ga', '_ga_JEDGQPSB9F']) {
      for (const domain of ['', '; Domain=' + location.hostname, '; Domain=universovet.cl']) {
        document.cookie = name + '=; Max-Age=0; Path=/' + domain;
      }
    }
  }
  function activate() {
    if (!document.body.hasAttribute('data-ga') || document.getElementById('ga-script')) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id);
    const script = document.createElement('script');
    script.id = 'ga-script';
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.append(script);
  }
  function apply(value) {
    const allowed = value === 'si';
    window['ga-disable-' + id] = !allowed;
    if (allowed) activate();
    else clearCookies();
    panel.hidden = allowed || value === 'no';
  }
  manage.hidden = false;
  apply(choice);
  let openedFromPreferences = false;
  manage.onclick = () => {
    openedFromPreferences = true;
    panel.hidden = false;
    panel.querySelector('button').focus({ preventScroll: true });
  };
  for (const button of panel.querySelectorAll('button')) {
    button.onclick = () => {
      const value = button.dataset.valor;
      try { localStorage.setItem(key, value); } catch {}
      const reload = value === 'no' && document.getElementById('ga-script');
      apply(value);
      if (openedFromPreferences) manage.focus({ preventScroll: true });
      openedFromPreferences = false;
      if (reload) location.reload();
    };
  }
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) {
      apply(event.newValue);
      if (event.newValue !== 'si' && document.getElementById('ga-script')) location.reload();
    }
  });
})();