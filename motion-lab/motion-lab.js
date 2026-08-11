document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    if (!window.gsap) {
        return;
    }

    const gsap = window.gsap;
    const hero = document.querySelector('[data-motion-root]');
    const visual = document.querySelector('[data-motion-visual]');
    const card = document.querySelector('[data-motion-card]');
    const image = document.querySelector('[data-motion-image]');
    const caption = document.querySelector('[data-motion-caption]');
    const orbit = document.querySelector('[data-motion-orbit]');
    const stars = Array.from(document.querySelectorAll('[data-motion-star]'));
    const sparks = Array.from(document.querySelectorAll('.motion-spark'));
    const trace = document.querySelector('[data-constellation-trace]');
    const tracePath = trace ? trace.querySelector('path') : null;
    const badge = document.querySelector('[data-motion-badge]');
    const title = document.querySelector('[data-motion-title]');
    const subtitle = document.querySelector('[data-motion-subtitle]');
    const actions = document.querySelector('[data-motion-actions]');
    const actionButtons = actions ? Array.from(actions.children) : [];
    const variantButtons = Array.from(document.querySelectorAll('[data-variant]'));
    const replayButton = document.getElementById('motion-replay');
    const summary = document.getElementById('motion-summary');

    if (!hero || !visual || !card || !image || !badge || !title || !subtitle || !actions) {
        return;
    }

    const variants = {
        orbit: {
            label: 'Órbita clínica',
            summary: 'La fotografía llega primero, la órbita se asienta alrededor de ella y el mensaje entra como una sola secuencia. Movimiento con principio y fin.'
        },
        constellation: {
            label: 'Constelación clínica',
            summary: 'El Hero permanece estable mientras una constelación breve conecta el universo visual; en escritorio, los elementos cósmicos reaccionan suavemente al puntero.'
        },
        focus: {
            label: 'Focus clínico',
            summary: 'La atención comienza en la fotografía clínica, que pasa de suave desenfoque a nitidez; después se revela el mensaje con una cadencia más sobria.'
        }
    };

    const allowedVariants = Object.keys(variants);
    let activeVariant = 'orbit';
    let activeMedia = null;

    const resetTargets = [
        visual,
        card,
        image,
        caption,
        orbit,
        badge,
        title,
        subtitle,
        actions,
        trace,
        tracePath,
        ...stars,
        ...sparks,
        ...actionButtons
    ].filter(Boolean);

    function resetScene() {
        if (activeMedia) {
            activeMedia.revert();
            activeMedia = null;
        }

        gsap.killTweensOf(resetTargets);
        gsap.set(resetTargets, { clearProps: 'all' });
    }

    function buildOrbitTimeline() {
        const tl = gsap.timeline({
            defaults: {
                ease: 'power3.out'
            }
        });

        tl.from(visual, {
            x: 52,
            scale: 0.965,
            rotation: 1.1,
            autoAlpha: 0,
            duration: 0.82,
            ease: 'expo.out'
        }, 0)
        .from(image, {
            scale: 1.045,
            duration: 1.02,
            ease: 'power2.out'
        }, 0)
        .from(orbit, {
            rotation: -105,
            scale: 0.68,
            autoAlpha: 0,
            duration: 0.98,
            ease: 'expo.out'
        }, 0.08)
        .from(stars, {
            scale: 0,
            autoAlpha: 0,
            duration: 0.38,
            stagger: 0.08,
            ease: 'power2.out'
        }, 0.4)
        .from(badge, {
            x: -14,
            autoAlpha: 0,
            duration: 0.4
        }, 0.16)
        .from(title, {
            y: 26,
            autoAlpha: 0,
            duration: 0.68,
            ease: 'expo.out'
        }, 0.24)
        .from(subtitle, {
            y: 14,
            autoAlpha: 0,
            duration: 0.46
        }, 0.42)
        .from(actionButtons, {
            y: 9,
            autoAlpha: 0,
            duration: 0.36,
            stagger: 0.07
        }, 0.54);

        return tl;
    }

    function buildConstellationTimeline() {
        const tl = gsap.timeline({
            defaults: {
                ease: 'power3.out'
            }
        });

        if (trace && tracePath) {
            gsap.set(trace, { autoAlpha: 1 });
            gsap.set(tracePath, { strokeDashoffset: 1 });
        }

        tl.from(visual, {
            scale: 0.987,
            autoAlpha: 0.72,
            duration: 0.55
        }, 0)
        .from(badge, {
            x: -8,
            autoAlpha: 0,
            duration: 0.34
        }, 0.08)
        .from(title, {
            x: -12,
            autoAlpha: 0,
            duration: 0.52,
            ease: 'expo.out'
        }, 0.15)
        .from(subtitle, {
            autoAlpha: 0,
            duration: 0.36
        }, 0.32)
        .from(actionButtons, {
            autoAlpha: 0,
            duration: 0.3,
            stagger: 0.06
        }, 0.4)
        .from(sparks, {
            scale: 0,
            autoAlpha: 0,
            duration: 0.26,
            stagger: 0.07,
            ease: 'power2.out'
        }, 0.18)
        .from(stars, {
            scale: 0.2,
            autoAlpha: 0,
            duration: 0.3,
            stagger: 0.08
        }, 0.24);

        if (tracePath) {
            tl.to(tracePath, {
                strokeDashoffset: 0,
                duration: 0.58,
                ease: 'power2.inOut'
            }, 0.2)
            .to(trace, {
                autoAlpha: 0.2,
                duration: 0.42,
                ease: 'power2.out'
            }, 0.72);
        }

        return tl;
    }

    function setupConstellationPointer() {
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            return function () {};
        }

        const orbitX = gsap.quickTo(orbit, 'x', { duration: 0.42, ease: 'power3.out' });
        const orbitY = gsap.quickTo(orbit, 'y', { duration: 0.42, ease: 'power3.out' });
        const sparkControllers = sparks.map(function (spark, index) {
            return {
                x: gsap.quickTo(spark, 'x', { duration: 0.48 + index * 0.04, ease: 'power3.out' }),
                y: gsap.quickTo(spark, 'y', { duration: 0.48 + index * 0.04, ease: 'power3.out' })
            };
        });

        function handlePointerMove(event) {
            const bounds = hero.getBoundingClientRect();
            const nx = ((event.clientX - bounds.left) / bounds.width) - 0.5;
            const ny = ((event.clientY - bounds.top) / bounds.height) - 0.5;

            orbitX(nx * 8);
            orbitY(ny * 6);

            sparkControllers.forEach(function (controller, index) {
                const strength = 5 + index * 2.5;
                controller.x(nx * strength);
                controller.y(ny * strength * 0.75);
            });
        }

        function handlePointerLeave() {
            orbitX(0);
            orbitY(0);
            sparkControllers.forEach(function (controller) {
                controller.x(0);
                controller.y(0);
            });
        }

        hero.addEventListener('pointermove', handlePointerMove, { passive: true });
        hero.addEventListener('pointerleave', handlePointerLeave);

        return function () {
            hero.removeEventListener('pointermove', handlePointerMove);
            hero.removeEventListener('pointerleave', handlePointerLeave);
        };
    }

    function buildFocusTimeline() {
        const tl = gsap.timeline({
            defaults: {
                ease: 'power3.out'
            }
        });

        tl.from(image, {
            filter: 'blur(13px) saturate(0.82)',
            scale: 1.055,
            autoAlpha: 0.82,
            duration: 0.88,
            ease: 'power2.out'
        }, 0)
        .from(card, {
            scale: 0.992,
            duration: 0.72,
            ease: 'power2.out'
        }, 0)
        .from(caption, {
            y: 12,
            autoAlpha: 0,
            duration: 0.4
        }, 0.42)
        .from(badge, {
            autoAlpha: 0,
            duration: 0.28
        }, 0.36)
        .from(title, {
            y: 18,
            autoAlpha: 0,
            duration: 0.56,
            ease: 'expo.out'
        }, 0.44)
        .from(subtitle, {
            y: 8,
            autoAlpha: 0,
            duration: 0.4
        }, 0.62)
        .from(actionButtons, {
            y: 7,
            autoAlpha: 0,
            duration: 0.32,
            stagger: 0.06
        }, 0.72)
        .from(stars, {
            scale: 0.5,
            autoAlpha: 0,
            duration: 0.28,
            stagger: 0.06
        }, 0.74);

        return tl;
    }

    function playVariant(name, updateAddress) {
        if (!allowedVariants.includes(name)) {
            name = 'orbit';
        }

        resetScene();
        activeVariant = name;
        document.body.dataset.motionVariant = name;

        variantButtons.forEach(function (button) {
            const isActive = button.dataset.variant === name;
            button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        if (summary) {
            summary.textContent = variants[name].summary;
        }

        if (updateAddress !== false) {
            const url = new URL(window.location.href);
            url.searchParams.set('variant', name);
            window.history.replaceState({}, '', url);
        }

        activeMedia = gsap.matchMedia();
        activeMedia.add('(prefers-reduced-motion: no-preference)', function () {
            let cleanupPointer = function () {};

            if (name === 'orbit') {
                buildOrbitTimeline();
            } else if (name === 'constellation') {
                buildConstellationTimeline();
                cleanupPointer = setupConstellationPointer();
            } else {
                buildFocusTimeline();
            }

            return function () {
                cleanupPointer();
            };
        }, hero);
    }

    variantButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            playVariant(button.dataset.variant, true);
        });
    });

    if (replayButton) {
        replayButton.addEventListener('click', function () {
            playVariant(activeVariant, false);
        });
    }

    actionButtons.forEach(function (button) {
        button.addEventListener('click', function (event) {
            event.preventDefault();
        });
    });

    const requestedVariant = new URLSearchParams(window.location.search).get('variant');
    playVariant(allowedVariants.includes(requestedVariant) ? requestedVariant : 'orbit', false);
});
