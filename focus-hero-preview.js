document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    if (!window.gsap) return;

    const gsap = window.gsap;
    const hero = document.querySelector('.hero');
    const image = document.querySelector('.hero .hero-clinic__image');
    const card = document.querySelector('.hero .hero-clinic');
    const caption = document.querySelector('.hero .hero-clinic__caption');
    const badge = document.querySelector('.hero .hero__badge');
    const title = document.querySelector('.hero .hero__title');
    const subtitle = document.querySelector('.hero .hero__subtitle');
    const actions = document.querySelector('.hero .hero__actions');
    const stars = Array.from(document.querySelectorAll('.hero .hero-clinic__star'));

    if (!hero || !image || !card || !caption || !badge || !title || !subtitle || !actions) return;

    const buttons = Array.from(actions.children);
    const ring = document.createElement('span');
    ring.className = 'hero-clinic__focus-ring';
    ring.setAttribute('aria-hidden', 'true');
    card.insertBefore(ring, image);

    const allTargets = [image, card, ring, caption, badge, title, subtitle].concat(buttons, stars);

    function restoreFinalState() {
        gsap.set(image, {
            filter: 'none',
            scale: 1,
            autoAlpha: 1,
            clearProps: 'filter,transform,opacity,visibility'
        });
        gsap.set(card, { clearProps: 'transform' });
        gsap.set(ring, { autoAlpha: 0, clearProps: 'transform,visibility' });
    }

    gsap.killTweensOf(allTargets);
    gsap.set(allTargets, { clearProps: 'all' });
    restoreFinalState();
    gsap.set([badge, title, subtitle, buttons, caption], { autoAlpha: 0 });

    const timeline = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: restoreFinalState
    });

    timeline
        .fromTo(image, {
            filter: 'blur(10px) saturate(0.92) brightness(0.96)',
            scale: 1.038,
            autoAlpha: 0.94
        }, {
            filter: 'none',
            scale: 1,
            autoAlpha: 1,
            duration: 0.62,
            ease: 'power2.out'
        }, 0)
        .fromTo(card, {
            scale: 1.008
        }, {
            scale: 1,
            duration: 0.56,
            ease: 'power2.out'
        }, 0)
        .fromTo(ring, {
            autoAlpha: 0,
            scale: 1.16
        }, {
            autoAlpha: 0.68,
            scale: 0.96,
            duration: 0.30,
            ease: 'expo.out'
        }, 0.08)
        .to(ring, {
            autoAlpha: 0,
            scale: 0.86,
            duration: 0.22,
            ease: 'power2.out'
        }, 0.34)
        .to(caption, { autoAlpha: 1, duration: 0.24 }, 0.34)
        .to(badge, { autoAlpha: 1, duration: 0.22 }, 0.30)
        .fromTo(title, {
            y: 14,
            autoAlpha: 0
        }, {
            y: 0,
            autoAlpha: 1,
            duration: 0.42,
            ease: 'expo.out'
        }, 0.36)
        .fromTo(subtitle, {
            y: 8,
            autoAlpha: 0
        }, {
            y: 0,
            autoAlpha: 1,
            duration: 0.30
        }, 0.52)
        .fromTo(buttons, {
            y: 6,
            autoAlpha: 0
        }, {
            y: 0,
            autoAlpha: 1,
            duration: 0.28,
            stagger: 0.05
        }, 0.64)
        .fromTo(stars, {
            scale: 0.72,
            autoAlpha: 0
        }, {
            scale: 1,
            autoAlpha: 1,
            duration: 0.22,
            stagger: 0.05
        }, 0.70);

    // The lab's preferred 0.5x playback: deliberately slowed for this preview.
    timeline.timeScale(0.5);

    window.addEventListener('pagehide', function () {
        timeline.kill();
        restoreFinalState();
    }, { once: true });
});
