(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        window.__universoVetGsap = window.gsap;
        window.gsap = null;
    }

    if (document.querySelector('.hero')) {
        const cosmicScript = document.createElement('script');
        cosmicScript.src = 'hero-cosmic.js';
        cosmicScript.async = false;
        document.head.appendChild(cosmicScript);
    }
})();
