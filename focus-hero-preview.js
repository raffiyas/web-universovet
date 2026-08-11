document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    if (!window.gsap) return;

    const gsap = window.gsap;

    let heroTimeline = null;
    let servicesTimeline = null;
    let servicesObserver = null;
    let trustTimeline = null;
    let trustObserver = null;
    let locationTimeline = null;
    let locationObserver = null;
    let ctaTimeline = null;
    let ctaObserver = null;

    function removeLegacyFade(elements) {
        elements.filter(Boolean).forEach(function (element) {
            element.classList.remove('fade-in', 'fade-in--visible');
            element.style.transitionDelay = '';
        });
    }

    function observeOnce(element, callback, options) {
        if (!element) return null;
        if (!('IntersectionObserver' in window)) {
            callback();
            return null;
        }

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    callback();
                    observer.disconnect();
                }
            });
        }, options);

        observer.observe(element);
        return observer;
    }

    // ------------------------------------------------------------
    // HERO — FOCUS CLÍNICO (preview aprobado a 0.5x)
    // ------------------------------------------------------------
    const hero = document.querySelector('.hero');
    const image = document.querySelector('.hero .hero-clinic__image');
    const card = document.querySelector('.hero .hero-clinic');
    const caption = document.querySelector('.hero .hero-clinic__caption');
    const badge = document.querySelector('.hero .hero__badge');
    const title = document.querySelector('.hero .hero__title');
    const subtitle = document.querySelector('.hero .hero__subtitle');
    const actions = document.querySelector('.hero .hero__actions');
    const stars = Array.from(document.querySelectorAll('.hero .hero-clinic__star'));

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
            .fromTo(card, { scale: 1.008 }, {
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
            .fromTo(title, { y: 14, autoAlpha: 0 }, {
                y: 0,
                autoAlpha: 1,
                duration: 0.42,
                ease: 'expo.out'
            }, 0.36)
            .fromTo(subtitle, { y: 8, autoAlpha: 0 }, {
                y: 0,
                autoAlpha: 1,
                duration: 0.30
            }, 0.52)
            .fromTo(buttons, { y: 6, autoAlpha: 0 }, {
                y: 0,
                autoAlpha: 1,
                duration: 0.28,
                stagger: 0.05
            }, 0.64)
            .fromTo(stars, { scale: 0.72, autoAlpha: 0 }, {
                scale: 1,
                autoAlpha: 1,
                duration: 0.22,
                stagger: 0.05
            }, 0.70);

        heroTimeline.timeScale(0.5);
    }

    // ------------------------------------------------------------
    // SERVICIOS — SISTEMA EN ÓRBITA
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

        removeLegacyFade([servicesHeader].concat(serviceCards));

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

            if (serviceBadge) servicesTimeline.to(serviceBadge, { y: 0, autoAlpha: 1, duration: 0.38 }, 0);
            if (serviceTitle) servicesTimeline.to(serviceTitle, { y: 0, autoAlpha: 1, duration: 0.58, ease: 'expo.out' }, 0.08);
            if (serviceDescription) servicesTimeline.to(serviceDescription, { y: 0, autoAlpha: 1, duration: 0.42 }, 0.22);

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

            servicesTimeline.timeScale(0.72);
        }

        servicesObserver = observeOnce(services, playServicesOrbit, {
            root: null,
            rootMargin: '0px 0px -12% 0px',
            threshold: 0.18
        });
    }

    // ------------------------------------------------------------
    // NOSOTROS — CONSTRUCCIÓN DE CONFIANZA
    // ------------------------------------------------------------
    const trust = document.querySelector('#nosotros');
    const trustCopy = trust ? trust.querySelector('.trust__copy') : null;
    const trustList = trust ? trust.querySelector('.trust__list') : null;
    const trustItems = trustList ? Array.from(trustList.querySelectorAll('li')) : [];

    if (trust && trustCopy && trustList && trustItems.length) {
        const trustBadge = trustCopy.querySelector('.section__badge');
        const trustTitle = trustCopy.querySelector('h2');
        const trustDescription = trustCopy.querySelector('p');

        removeLegacyFade([trustCopy].concat(trustItems));

        const trustStyle = document.createElement('style');
        trustStyle.setAttribute('data-trust-motion-preview', '');
        trustStyle.textContent = [
            '#nosotros.trust-motion-preview .trust__list{position:relative}',
            '#nosotros.trust-motion-preview .trust__list li{position:relative;z-index:2}',
            '.trust-motion-line{position:absolute;z-index:1;left:-13px;top:18px;bottom:18px;width:1px;background:linear-gradient(180deg,rgba(59,199,191,.48),rgba(107,53,216,.32));box-shadow:0 0 12px rgba(59,199,191,.12);transform-origin:top center;pointer-events:none}',
            '@media(max-width:760px){.trust-motion-line{left:8px;top:-12px;bottom:-12px;opacity:.45}}'
        ].join('');
        document.head.appendChild(trustStyle);

        trust.classList.add('trust-motion-preview');

        const trustLine = document.createElement('span');
        trustLine.className = 'trust-motion-line';
        trustLine.setAttribute('aria-hidden', 'true');
        trustList.prepend(trustLine);

        if (trustBadge) gsap.set(trustBadge, { x: -8, y: 8, autoAlpha: 0 });
        if (trustTitle) gsap.set(trustTitle, { x: -14, y: 8, autoAlpha: 0 });
        if (trustDescription) gsap.set(trustDescription, { x: -8, y: 6, autoAlpha: 0 });
        gsap.set(trustLine, { scaleY: 0, autoAlpha: 0 });
        gsap.set(trustItems, { x: 22, y: 4, scale: 0.992, autoAlpha: 0 });

        function restoreTrustFinalState() {
            [trustBadge, trustTitle, trustDescription].concat(trustItems).filter(Boolean).forEach(function (element) {
                gsap.set(element, { clearProps: 'transform,opacity,visibility' });
            });
            gsap.set(trustLine, { scaleY: 1, autoAlpha: 0.26 });
        }

        function playTrustMotion() {
            if (trustTimeline) return;

            trustTimeline = gsap.timeline({
                defaults: { ease: 'power3.out' },
                onComplete: function () {
                    restoreTrustFinalState();
                    trustTimeline = null;
                }
            });

            if (trustBadge) trustTimeline.to(trustBadge, { x: 0, y: 0, autoAlpha: 1, duration: 0.36 }, 0);
            if (trustTitle) trustTimeline.to(trustTitle, { x: 0, y: 0, autoAlpha: 1, duration: 0.62, ease: 'expo.out' }, 0.08);
            if (trustDescription) trustTimeline.to(trustDescription, { x: 0, y: 0, autoAlpha: 1, duration: 0.46 }, 0.24);

            trustTimeline
                .to(trustLine, {
                    scaleY: 1,
                    autoAlpha: 0.52,
                    duration: 0.86,
                    ease: 'power2.inOut'
                }, 0.20)
                .to(trustItems, {
                    x: 0,
                    y: 0,
                    scale: 1,
                    autoAlpha: 1,
                    duration: 0.58,
                    stagger: 0.14,
                    ease: 'power3.out'
                }, 0.32)
                .to(trustLine, {
                    autoAlpha: 0.26,
                    duration: 0.38,
                    ease: 'power2.out'
                }, 1.08);

            trustTimeline.timeScale(0.78);
        }

        trustObserver = observeOnce(trust, playTrustMotion, {
            root: null,
            rootMargin: '0px 0px -14% 0px',
            threshold: 0.2
        });
    }

    // ------------------------------------------------------------
    // UBICACIÓN — LLEGADA
    // Texto y datos se acercan desde la izquierda; el mapa se descubre desde la derecha.
    // ------------------------------------------------------------
    const location = document.querySelector('#ubicacion');
    const locationGrid = location ? location.querySelector('.location__grid') : null;
    const locationCopy = locationGrid ? locationGrid.firstElementChild : null;
    const locationMap = location ? location.querySelector('.location__map') : null;
    const locationBlocks = location ? Array.from(location.querySelectorAll('.location__block')) : [];

    if (location && locationCopy && locationMap) {
        const locationBadge = locationCopy.querySelector('.section__badge');
        const locationTitle = locationCopy.querySelector('.section__title');
        const locationDescription = locationCopy.querySelector('.section__description');

        removeLegacyFade(locationBlocks);

        const locationStyle = document.createElement('style');
        locationStyle.setAttribute('data-location-motion-preview', '');
        locationStyle.textContent = [
            '#ubicacion.location-motion-preview .location__map{position:relative;isolation:isolate}',
            '.location-arrival-pulse{position:absolute;z-index:4;left:50%;top:50%;width:34px;height:34px;margin:-17px 0 0 -17px;border:1px solid rgba(59,199,191,.55);border-radius:50%;box-shadow:0 0 0 5px rgba(59,199,191,.06);pointer-events:none;opacity:0}',
            '@media(max-width:760px){.location-arrival-pulse{width:28px;height:28px;margin:-14px 0 0 -14px}}'
        ].join('');
        document.head.appendChild(locationStyle);
        location.classList.add('location-motion-preview');

        const arrivalPulse = document.createElement('span');
        arrivalPulse.className = 'location-arrival-pulse';
        arrivalPulse.setAttribute('aria-hidden', 'true');
        locationMap.appendChild(arrivalPulse);

        if (locationBadge) gsap.set(locationBadge, { x: -10, y: 6, autoAlpha: 0 });
        if (locationTitle) gsap.set(locationTitle, { x: -18, y: 8, autoAlpha: 0 });
        if (locationDescription) gsap.set(locationDescription, { x: -12, y: 6, autoAlpha: 0 });
        gsap.set(locationBlocks, { x: -20, y: 6, autoAlpha: 0 });
        gsap.set(locationMap, {
            x: 28,
            scale: 0.992,
            autoAlpha: 0.42,
            clipPath: 'inset(0 16% 0 0 round 30px)'
        });
        gsap.set(arrivalPulse, { scale: 0.65, autoAlpha: 0 });

        function restoreLocationFinalState() {
            [locationBadge, locationTitle, locationDescription].concat(locationBlocks).filter(Boolean).forEach(function (element) {
                gsap.set(element, { clearProps: 'transform,opacity,visibility' });
            });
            gsap.set(locationMap, { clearProps: 'transform,opacity,visibility,clipPath' });
            gsap.set(arrivalPulse, { autoAlpha: 0, clearProps: 'transform,visibility' });
        }

        function playLocationMotion() {
            if (locationTimeline) return;

            locationTimeline = gsap.timeline({
                defaults: { ease: 'power3.out' },
                onComplete: function () {
                    restoreLocationFinalState();
                    locationTimeline = null;
                }
            });

            if (locationBadge) locationTimeline.to(locationBadge, { x: 0, y: 0, autoAlpha: 1, duration: 0.36 }, 0);
            if (locationTitle) locationTimeline.to(locationTitle, { x: 0, y: 0, autoAlpha: 1, duration: 0.60, ease: 'expo.out' }, 0.08);
            if (locationDescription) locationTimeline.to(locationDescription, { x: 0, y: 0, autoAlpha: 1, duration: 0.44 }, 0.22);

            locationTimeline
                .to(locationMap, {
                    x: 0,
                    scale: 1,
                    autoAlpha: 1,
                    clipPath: 'inset(0 0% 0 0 round 30px)',
                    duration: 0.92,
                    ease: 'power3.inOut'
                }, 0.12)
                .to(locationBlocks, {
                    x: 0,
                    y: 0,
                    autoAlpha: 1,
                    duration: 0.54,
                    stagger: 0.13,
                    ease: 'power3.out'
                }, 0.38)
                .fromTo(arrivalPulse, {
                    scale: 0.65,
                    autoAlpha: 0.34
                }, {
                    scale: 1.7,
                    autoAlpha: 0,
                    duration: 0.70,
                    ease: 'power2.out'
                }, 0.82);

            locationTimeline.timeScale(0.78);
        }

        locationObserver = observeOnce(location, playLocationMotion, {
            root: null,
            rootMargin: '0px 0px -12% 0px',
            threshold: 0.18
        });
    }

    // ------------------------------------------------------------
    // CTA FINAL — SEÑAL
    // Un único gesto de llamada a la acción y luego reposo completo.
    // ------------------------------------------------------------
    const cta = document.querySelector('#contacto');
    const ctaContent = cta ? cta.querySelector('.cta__content') : null;

    if (cta && ctaContent) {
        const ctaSpark = ctaContent.querySelector('.cta__spark');
        const ctaTitle = ctaContent.querySelector('h2');
        const ctaDescription = ctaContent.querySelector('p');
        const ctaButton = ctaContent.querySelector('.btn');

        removeLegacyFade([ctaContent]);

        const ctaStyle = document.createElement('style');
        ctaStyle.setAttribute('data-cta-signal-preview', '');
        ctaStyle.textContent = [
            '#contacto.cta-signal-preview .cta__content{position:relative}',
            '#contacto.cta-signal-preview .btn--primary{position:relative;isolation:isolate}',
            '.cta-signal-ring{position:absolute;z-index:2;inset:-7px;border:1px solid rgba(59,199,191,.48);border-radius:999px;pointer-events:none;opacity:0}'
        ].join('');
        document.head.appendChild(ctaStyle);
        cta.classList.add('cta-signal-preview');

        let signalRing = null;
        if (ctaButton) {
            signalRing = document.createElement('span');
            signalRing.className = 'cta-signal-ring';
            signalRing.setAttribute('aria-hidden', 'true');
            ctaButton.appendChild(signalRing);
        }

        if (ctaSpark) gsap.set(ctaSpark, { scale: 0.72, autoAlpha: 0 });
        if (ctaTitle) gsap.set(ctaTitle, { y: 14, autoAlpha: 0 });
        if (ctaDescription) gsap.set(ctaDescription, { y: 9, autoAlpha: 0 });
        if (ctaButton) gsap.set(ctaButton, { y: 8, scale: 0.99, autoAlpha: 0 });
        if (signalRing) gsap.set(signalRing, { scale: 0.88, autoAlpha: 0 });

        function restoreCtaFinalState() {
            [ctaSpark, ctaTitle, ctaDescription, ctaButton].filter(Boolean).forEach(function (element) {
                gsap.set(element, { clearProps: 'transform,opacity,visibility' });
            });
            if (signalRing) gsap.set(signalRing, { autoAlpha: 0, clearProps: 'transform,visibility' });
        }

        function playCtaMotion() {
            if (ctaTimeline) return;

            ctaTimeline = gsap.timeline({
                defaults: { ease: 'power3.out' },
                onComplete: function () {
                    restoreCtaFinalState();
                    ctaTimeline = null;
                }
            });

            if (ctaSpark) ctaTimeline.to(ctaSpark, { scale: 1, autoAlpha: 1, duration: 0.40 }, 0);
            if (ctaTitle) ctaTimeline.to(ctaTitle, { y: 0, autoAlpha: 1, duration: 0.62, ease: 'expo.out' }, 0.08);
            if (ctaDescription) ctaTimeline.to(ctaDescription, { y: 0, autoAlpha: 1, duration: 0.42 }, 0.26);
            if (ctaButton) ctaTimeline.to(ctaButton, { y: 0, scale: 1, autoAlpha: 1, duration: 0.46 }, 0.42);
            if (signalRing) {
                ctaTimeline.fromTo(signalRing, {
                    scale: 0.88,
                    autoAlpha: 0.42
                }, {
                    scale: 1.42,
                    autoAlpha: 0,
                    duration: 0.78,
                    ease: 'power2.out'
                }, 0.70);
            }

            ctaTimeline.timeScale(0.82);
        }

        ctaObserver = observeOnce(cta, playCtaMotion, {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.24
        });
    }

    window.addEventListener('pagehide', function () {
        if (heroTimeline) heroTimeline.kill();
        if (servicesTimeline) servicesTimeline.kill();
        if (servicesObserver) servicesObserver.disconnect();
        if (trustTimeline) trustTimeline.kill();
        if (trustObserver) trustObserver.disconnect();
        if (locationTimeline) locationTimeline.kill();
        if (locationObserver) locationObserver.disconnect();
        if (ctaTimeline) ctaTimeline.kill();
        if (ctaObserver) ctaObserver.disconnect();
    }, { once: true });
});
