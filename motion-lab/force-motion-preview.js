(function () {
    'use strict';

    const nativeMatchMedia = window.matchMedia.bind(window);
    const systemPrefersReducedMotion = nativeMatchMedia('(prefers-reduced-motion: reduce)').matches;

    window.__universoVetMotionLabSystemReducedMotion = systemPrefersReducedMotion;

    window.matchMedia = function (query) {
        if (typeof query === 'string' && query.trim() === '(prefers-reduced-motion: no-preference)') {
            return nativeMatchMedia('(min-width: 0px)');
        }

        return nativeMatchMedia(query);
    };

    document.addEventListener('DOMContentLoaded', function () {
        const diagnostic = document.getElementById('motion-diagnostic');
        if (!diagnostic) {
            return;
        }

        diagnostic.textContent = systemPrefersReducedMotion
            ? 'Diagnóstico: tu sistema está solicitando reducir movimiento. En este laboratorio las animaciones están FORZADAS sólo para poder compararlas.'
            : 'Diagnóstico: animaciones habilitadas normalmente. El laboratorio fuerza su ejecución para que las tres variantes sean comparables.';
    });
})();
