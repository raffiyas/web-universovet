(function () {
    'use strict';

    function initCosmicHero() {
        const hero = document.querySelector('.hero');
        const heroVisual = hero ? hero.querySelector('.hero__visual') : null;
        const heroClinic = heroVisual ? heroVisual.querySelector('.hero-clinic') : null;

        if (!hero || !heroVisual || !heroClinic || heroVisual.querySelector('.cosmic-field')) return;

        document.body.classList.add('hero-cosmic-enabled');

        const cosmicField = document.createElement('div');
        cosmicField.className = 'cosmic-field';
        cosmicField.setAttribute('aria-hidden', 'true');
        cosmicField.innerHTML = [
            '<svg class="cosmic-orbits" viewBox="0 0 760 660" fill="none" preserveAspectRatio="none">',
            '<ellipse class="cosmic-orbit cosmic-orbit--aqua" cx="408" cy="334" rx="360" ry="224" transform="rotate(-12 408 334)"></ellipse>',
            '<ellipse class="cosmic-orbit cosmic-orbit--lilac" cx="390" cy="324" rx="314" ry="286" transform="rotate(17 390 324)"></ellipse>',
            '<path class="cosmic-orbit cosmic-orbit--blend" d="M-18 466C146 338 268 287 426 258C566 232 683 164 782 46"></path>',
            '</svg>',
            '<svg class="cosmic-constellation cosmic-constellation--north" viewBox="0 0 112 78" fill="none">',
            '<path d="M8 55L31 34L55 43L75 15L102 27"></path>',
            '<g><circle cx="8" cy="55" r="2.3"></circle><circle cx="31" cy="34" r="1.8"></circle><circle cx="55" cy="43" r="2.1"></circle><circle cx="75" cy="15" r="2.5"></circle><circle cx="102" cy="27" r="1.7"></circle></g>',
            '</svg>',
            '<svg class="cosmic-constellation cosmic-constellation--west" viewBox="0 0 94 70" fill="none">',
            '<path d="M6 18L28 31L48 16L61 43L87 56"></path>',
            '<g><circle cx="6" cy="18" r="1.8"></circle><circle cx="28" cy="31" r="2.2"></circle><circle cx="48" cy="16" r="1.6"></circle><circle cx="61" cy="43" r="2.4"></circle><circle cx="87" cy="56" r="1.8"></circle></g>',
            '</svg>',
            '<span class="cosmic-star cosmic-star--one"></span>',
            '<span class="cosmic-star cosmic-star--two"></span>',
            '<span class="cosmic-star cosmic-star--three"></span>',
            '<span class="cosmic-star cosmic-star--four"></span>',
            '<span class="cosmic-star cosmic-star--five"></span>'
        ].join('');

        heroVisual.insertBefore(cosmicField, heroClinic);

        if (!window.gsap) return;

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

        window.addEventListener('pagehide', function cleanupCosmicHero() {
            media.revert();
        }, { once: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCosmicHero, { once: true });
    } else {
        initCosmicHero();
    }
})();
