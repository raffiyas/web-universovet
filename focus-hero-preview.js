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

    let heroTimeline = null;
    let servicesTimeline = null;
    let servicesObserver = null;

    // ------------------------------------------------------------
    // HERO — FOCUS CLÍNICO (preview aprobado a 0.5x)
    // ------------------------------------------------------------
    if (hero && image && card && caption && badge && title && subtitle && actions) {
        const buttons = Array.from(actions.children);
        const ring = document.createElement('span');
        ring.className = 'hero-clinic__focus-ring';
        ring.setAttribute('aria-hidden', 'true');
        card.insertBefore(ring, image);

        const allTargets = [image, card, ring, caption, badge, title, subtitle].concat(buttons, stars);

        function restoreHeroFinalState() {
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
        restoreHeroFinalState();
        gsap.set([badge, title, subtitle, buttons, caption], { autoAlpha: 0 });

        heroTimeline = gsap.timeline({
            defaults: { ease: 'power3.out' },
            onComplete: restoreHeroFinalState
        });

        heroTimeline
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

        heroTimeline.timeScale(0.5);
    }

    // ------------------------------------------------------------
    // SERVICIOS — SISTEMA EN ÓRBITA
    // Preview: una sola coreografía al entrar al viewport.
    // ------------------------------------------------------------
    const services = document.querySelector('#servicios');
    const servicesHeader = services ? services.querySelector('.section__header') : null;
    const serviceCards = services ? Array.from(services.querySelectorAll('.service-card')) : [];

    if (services && servicesHeader && serviceCards.length) {
        const serviceBadge = servicesHeader.querySelector('.section__badge');
        const serviceTitle = servicesHeader.querySelector('.section__title');
        const serviceDescription = servicesHeader.querySelector('.section__description');
        const serviceIcons = serviceCards.map(function (serviceCard) {
            return serviceCard.querySelector('.service-card__icon');
        }).filter(Boolean);

        // El landing actual aplica un fade-in genérico a Servicios. En este preview
        // lo retiramos sólo de esta sección para no sumar dos lenguajes de movimiento.
        [servicesHeader].concat(serviceCards).forEach(function (element) {
            element.classList.remove('fade-in', 'fade-in--visible');
            element.style.transitionDelay = '';
        });

        const style = document.createElement('style');
        style.setAttribute('data-services-orbit-preview', '');
        style.textContent = [
            '#servicios.services-orbit-preview .services__grid{position:relative;isolation:isolate}',
            '#servicios.services-orbit-preview .service-card{position:relative;z-index:2}',
            '#servicios.services-orbit-preview.services-orbit-running .service-card{transition:none!important;will-change:transform,opacity}',
            '#servicios.services-orbit-preview.services-orbit-running .service-card__icon{will-change:transform,opacity}',
            '.services-orbit-trace{position:absolute;z-index:1;left:8%;right:8%;top:7%;bottom:7%;border:1px solid rgba(107,53,216,.18);border-left-color:rgba(59,199,191,.20);border-bottom-color:rgba(59,199,191,.10);border-radius:50%;pointer-events:none;opacity:0;transform-origin:center}',
            '@media(max-width:760px){.services-orbit-trace{left:18%;right:18%;top:3%;bottom:3%}}'
        ].join('');
        document.head.appendChild(style);

        services.classList.add('services-orbit-preview', 'services-orbit-running');

        const grid = services.querySelector('.services__grid');
        const orbitTrace = document.createElement('span');
        orbitTrace.className = 'services-orbit-trace';
        orbitTrace.setAttribute('aria-hidden', 'true');
        if (grid) grid.prepend(orbitTrace);

        const compactLayout = window.matchMedia('(max-width: 760px)').matches;
        const desktopOffsets = [
            { x: -72, y: -26, rotation: -2.2 },
            { x: 0, y: -48, rotation: -0.8 },
            { x: 72, y: -26, rotation: 2.2 },
            { x: -72, y: 28, rotation: 1.8 },
            { x: 0, y: 48, rotation: 0.8 },
            { x: 72, y: 28, rotation: -1.8 }
        ];
        const mobileOffsets = [
            { x: -28, y: 14, rotation: -1.2 },
            { x: 28, y: 14, rotation: 1.2 },
            { x: -28, y: 14, rotation: -1.2 },
            { x: 28, y: 14, rotation: 1.2 },
            { x: -28, y: 14, rotation: -1.2 },
            { x: 28, y: 14, rotation: 1.2 }
        ];
        const offsets = compactLayout ? mobileOffsets : desktopOffsets;

        // Estado inicial: el espacio se conserva, pero la composición todavía no se arma.
        if (serviceBadge) gsap.set(serviceBadge, { y: 12, autoAlpha: 0 });
        if (serviceTitle) gsap.set(serviceTitle, { y: 20, autoAlpha: 0 });
        if (serviceDescription) gsap.set(serviceDescription, { y: 12, autoAlpha: 0 });
        gsap.set(orbitTrace, { scale: 0.76, rotation: -7, autoAlpha: 0 });
        serviceCards.forEach(function (serviceCard, index) {
            const offset = offsets[index] || { x: 0, y: 24, rotation: 0 };
            gsap.set(serviceCard, {
                x: offset.x,
                y: offset.y,
                rotation: offset.rotation,
                scale: 0.94,
                autoAlpha: 0
            });
        });
        serviceIcons.forEach(function (icon, index) {
            gsap.set(icon, {
                scale: 0.72,
                rotation: index % 2 === 0 ? -10 : 10,
                autoAlpha: 0.55
            });
        });

        function restoreServicesFinalState() {
            const targets = [serviceBadge, serviceTitle, serviceDescription, orbitTrace]
                .concat(serviceCards, serviceIcons)
                .filter(Boolean);
            gsap.set(targets, { clearProps: 'transform,opacity,visibility' });
            gsap.set(orbitTrace, { autoAlpha: 0 });
            services.classList.remove('services-orbit-running');
        }

        function playServicesOrbit() {
            if (servicesTimeline) return;

            servicesTimeline = gsap.timeline({
                defaults: { ease: 'power3.out' },
                onComplete: function () {
                    restoreServicesFinalState();
                    servicesTimeline = null;
                }
            });

            if (serviceBadge) {
                servicesTimeline.to(serviceBadge, {
                    y: 0,
                    autoAlpha: 1,
                    duration: 0.38
                }, 0);
            }
            if (serviceTitle) {
                servicesTimeline.to(serviceTitle, {
                    y: 0,
                    autoAlpha: 1,
                    duration: 0.58,
                    ease: 'expo.out'
                }, 0.08);
            }
            if (serviceDescription) {
                servicesTimeline.to(serviceDescription, {
                    y: 0,
                    autoAlpha: 1,
                    duration: 0.42
                }, 0.22);
            }

            servicesTimeline
                .to(orbitTrace, {
                    scale: 1,
                    rotation: 0,
                    autoAlpha: 0.55,
                    duration: 0.92,
                    ease: 'power2.out'
                }, 0.18)
                .to(serviceCards, {
                    x: 0,
                    y: 0,
                    rotation: 0,
                    scale: 1,
                    autoAlpha: 1,
                    duration: 0.78,
                    stagger: 0.075,
                    ease: 'expo.out'
                }, 0.32)
                .to(serviceIcons, {
                    scale: 1,
                    rotation: 0,
                    autoAlpha: 1,
                    duration: 0.34,
                    stagger: 0.065,
                    ease: 'back.out(1.35)'
                }, 0.58)
                .to(orbitTrace, {
                    autoAlpha: 0,
                    scale: 1.04,
                    duration: 0.44,
                    ease: 'power2.out'
                }, 1.02);

            // Algo más pausado que una entrada estándar, pero más ágil que el Hero a 0.5x.
            servicesTimeline.timeScale(0.72);
        }

        if ('IntersectionObserver' in window) {
            servicesObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        playServicesOrbit();
                        servicesObserver.disconnect();
                        servicesObserver = null;
                    }
                });
            }, {
                root: null,
                rootMargin: '0px 0px -12% 0px',
                threshold: 0.18
            });
            servicesObserver.observe(services);
        } else {
            playServicesOrbit();
        }
    }

    window.addEventListener('pagehide', function () {
        if (heroTimeline) heroTimeline.kill();
        if (servicesTimeline) servicesTimeline.kill();
        if (servicesObserver) servicesObserver.disconnect();
    }, { once: true });
});
