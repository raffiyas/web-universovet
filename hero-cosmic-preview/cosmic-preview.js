document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    if (!window.gsap) return;

    const hero = document.querySelector('.cosmic-hero-preview .hero');
    if (!hero) return;

    const gsap = window.gsap;
    const media = gsap.matchMedia();

    media.add({
        reduceMotion: '(prefers-reduced-motion: reduce)',
        mobile: '(max-width: 620px)'
    }, function (context) {
        const orbits = hero.querySelectorAll('.cosmic-orbit');
        const constellations = hero.querySelectorAll('.cosmic-constellation');
        const constellationLines = hero.querySelectorAll('.cosmic-constellation path');
        const stars = hero.querySelectorAll('.cosmic-star');

        if (context.conditions.reduceMotion) {
            gsap.set([orbits, constellations, stars], { clearProps: 'all' });
            return;
        }

        constellationLines.forEach(function (line) {
            const length = line.getTotalLength();
            gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });
        });

        const timeline = gsap.timeline({
            delay: 1.55,
            defaults: { ease: 'power2.out' }
        });

        timeline
            .fromTo(orbits, {
                autoAlpha: 0,
                scale: context.conditions.mobile ? .992 : .985,
                transformOrigin: '50% 50%'
            }, {
                autoAlpha: 1,
                scale: 1,
                duration: 1.15,
                stagger: .08,
                clearProps: 'transform,visibility'
            }, 0)
            .to(constellationLines, {
                strokeDashoffset: 0,
                duration: .9,
                stagger: .12,
                ease: 'power1.inOut'
            }, .24)
            .fromTo(constellations, { autoAlpha: 0 }, {
                autoAlpha: 1,
                duration: .7,
                stagger: .12
            }, .24)
            .fromTo(stars, { autoAlpha: 0, scale: .72 }, {
                autoAlpha: 1,
                scale: 1,
                duration: .55,
                stagger: .08,
                clearProps: 'transform,visibility'
            }, .68);

        return function () { timeline.kill(); };
    });

    window.addEventListener('pagehide', function cleanupCosmicPreview() {
        media.revert();
    }, { once: true });
});
