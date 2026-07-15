document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    const bottomCta = document.getElementById('preview-bottom-cta');
    const hero = document.querySelector('.preview-hero');
    const finalCta = document.querySelector('.preview-final');

    if (!bottomCta || !hero || !finalCta || !('IntersectionObserver' in window)) return;

    let heroVisible = true;
    let finalVisible = false;

    function updateBottomCta() {
        const shouldShow = window.matchMedia('(max-width: 768px)').matches && !heroVisible && !finalVisible;
        bottomCta.classList.toggle('is-visible', shouldShow);
        bottomCta.classList.toggle('is-hidden-near-final', finalVisible);
    }

    const heroObserver = new IntersectionObserver(function(entries) {
        heroVisible = entries[0].isIntersecting;
        updateBottomCta();
    }, { threshold: 0.05 });

    const finalObserver = new IntersectionObserver(function(entries) {
        finalVisible = entries[0].isIntersecting;
        updateBottomCta();
    }, { threshold: 0.05, rootMargin: '0px 0px -8% 0px' });

    heroObserver.observe(hero);
    finalObserver.observe(finalCta);
    window.addEventListener('resize', updateBottomCta);
    updateBottomCta();
});
