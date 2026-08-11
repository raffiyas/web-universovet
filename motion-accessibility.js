(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        window.__universoVetGsap = window.gsap;
        window.gsap = null;
    }
})();
