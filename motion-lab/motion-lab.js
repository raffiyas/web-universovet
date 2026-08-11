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
    const focusRing = document.querySelector('[data-motion-focus-ring]');
    const badge = document.querySelector('[data-motion-badge]');
    const title = document.querySelector('[data-motion-title]');
    const subtitle = document.querySelector('[data-motion-subtitle]');
    const actions = document.querySelector('[data-motion-actions]');
    const actionButtons = actions ? Array.from(actions.children) : [];
    const variantButtons = Array.from(document.querySelectorAll('[data-variant]'));
    const speedButtons = Array.from(document.querySelectorAll('[data-speed]'));
    const replayButton = document.getElementById('motion-replay');
    const summary = document.getElementById('motion-summary');

    if (!hero || !visual || !card || !image || !badge || !title || !subtitle || !actions) {
        return;
    }

    const variants = {
        orbit: {
            label: 'Órbita clínica',
            summary: 'DEMO EXAGERADA · La fotografía entra claramente desde la derecha, la órbita completa un asentamiento visible y después llega el mensaje. La versión final sería más contenida.'
        },
        constellation: {
            label: 'Constelación clínica',
            summary: 'DEMO EXAGERADA · El Hero permanece casi quieto: aparecen nodos, se dibuja una constelación sobre la escena y luego el campo cósmico responde al puntero.'
        },
        focus: {
            label: 'Focus clínico',
            summary: 'DEMO EXAGERADA · La fotografía parte desenfocada y ampliada, aparece un anillo de enfoque y sólo cuando la imagen queda nítida se revela el mensaje.'
        }
    };

    const allowedVariants = Object.keys(variants);
    let activeVariant = 'orbit';
    let activeMedia = null;
    let playbackSpeed = 1;

    const resetTargets = [
        visual,
        card,
        image,
        caption,
        orbit,
        focusRing,
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

    function runTimeline(timeline) {
        timeline.timeScale(playbackSpeed);
        return timeline;
    }

    function buildOrbitTimeline() {
        const tl = gsap.timeline({
            defaults: {
                ease: 'power3.out'
            }
        });

        tl.from(visual, {
            x: 190,
            y: 26,
            scale: 0.88,
            rotation: 5,
            autoAlpha: 0,
            duration: 1.08,
            ease: 'expo.out'
        }, 0)
        .from(image, {
            scale: 1.12,
            duration: 1.24,
            ease: 'power2.out'
        }, 0)
        .from(orbit, {
            rotation: -240,
            scale: 0.34,
            autoAlpha: 0,
            duration: 1.38,
            ease: 'expo.out'
        }, 0.05)
        .from(stars, {
            x: function (index) { return index === 0 ? 92 : -68; },
            y: function (index) { return index === 0 ? -58 : 72; },
            scale: 0,
            autoAlpha: 0,
            duration: 0.72,
            stagger: 0.12,
            ease: 'power3.out'
        }, 0.42)
        .from(badge, {
            x: -36,
            autoAlpha: 0,
            duration: 0.5
        }, 0.36)
        .from(title, {
            x: -62,
            y: 18,
            autoAlpha: 0,
            duration: 0.78,
            ease: 'expo.out'
        }, 0.48)
        .from(subtitle, {
            y: 24,
            autoAlpha: 0,
            duration: 0.54
        }, 0.72)
        .from(actionButtons, {
            y: 18,
            autoAlpha: 0,
            duration: 0.44,
            stagger: 0.09
        }, 0.88);

        return runTimeline(tl);
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

        gsap.set([badge, title, subtitle, actionButtons], { autoAlpha: 1 });

        tl.from(card, {
            autoAlpha: 0.78,
            duration: 0.35
        }, 0)
        .from(sparks, {
            x: function (index) {
                return [-90, 42, 110, -55][index] || 0;
            },
            y: function (index) {
                return [70, -72, 46, -84][index] || 0;
            },
            scale: 0,
            autoAlpha: 0,
            duration: 0.58,
            stagger: 0.11,
            ease: 'expo.out'
        }, 0.04)
        .from(stars, {
            scale: 0,
            autoAlpha: 0,
            duration: 0.42,
            stagger: 0.1
        }, 0.18);

        if (tracePath && trace) {
            tl.to(tracePath, {
                strokeDashoffset: 0,
                duration: 1.15,
                ease: 'power2.inOut'
            }, 0.28)
            .to(trace, {
                autoAlpha: 0.5,
                duration: 0.52,
                ease: 'power2.out'
            }, 1.42);
        }

        tl.to(sparks, {
            scale: 1.65,
            duration: 0.24,
            stagger: 0.05,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut'
        }, 0.74)
        .from(caption, {
            autoAlpha: 0.35,
            duration: 0.44
        }, 1.02);

        return runTimeline(tl);
    }

    function setupConstellationPointer() {
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            return function () {};
        }

        const cardX = gsap.quickTo(card, 'x', { duration: 0.55, ease: 'power3.out' });
        const cardY = gsap.quickTo(card, 'y', { duration: 0.55, ease: 'power3.out' });
        const orbitX = gsap.quickTo(orbit, 'x', { duration: 0.48, ease: 'power3.out' });
        const orbitY = gsap.quickTo(orbit, 'y', { duration: 0.48, ease: 'power3.out' });
        const sparkControllers = sparks.map(function (spark, index) {
            return {
                x: gsap.quickTo(spark, 'x', { duration: 0.5 + index * 0.04, ease: 'power3.out' }),
                y: gsap.quickTo(spark, 'y', { duration: 0.5 + index * 0.04, ease: 'power3.out' })
            };
        });

        function handlePointerMove(event) {
            const bounds = hero.getBoundingClientRect();
            const nx = ((event.clientX - bounds.left) / bounds.width) - 0.5;
            const ny = ((event.clientY - bounds.top) / bounds.height) - 0.5;

            cardX(nx * -16);
            cardY(ny * -10);
            orbitX(nx * 22);
            orbitY(ny * 16);

            sparkControllers.forEach(function (controller, index) {
                const strength = 16 + index * 7;
                controller.x(nx * strength);
                controller.y(ny * strength * 0.8);
            });
        }

        function handlePointerLeave() {
            cardX(0);
            cardY(0);
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

        gsap.set([badge, title, subtitle, actionButtons, caption], { autoAlpha: 0 });

        tl.from(image, {
            filter: 'blur(28px) saturate(0.62) brightness(0.82)',
            scale: 1.16,
            autoAlpha: 0.7,
            duration: 1.42,
            ease: 'power2.out'
        }, 0)
        .from(card, {
            scale: 1.025,
            duration: 1.2,
            ease: 'power2.out'
        }, 0)
        .fromTo(focusRing, {
            autoAlpha: 0,
            scale: 1.65
        }, {
            autoAlpha: 1,
            scale: 1,
            duration: 0.54,
            ease: 'expo.out'
        }, 0.12)
        .to(focusRing, {
            scale: 0.74,
            duration: 0.48,
            ease: 'power2.inOut'
        }, 0.66)
        .to(focusRing, {
            autoAlpha: 0,
            duration: 0.36,
            ease: 'power2.out'
        }, 1.08)
        .to(caption, {
            autoAlpha: 1,
            duration: 0.42
        }, 1.05)
        .to(badge, {
            autoAlpha: 1,
            duration: 0.32
        }, 1.12)
        .to(title, {
            autoAlpha: 1,
            y: 0,
            duration: 0.68,
            ease: 'expo.out'
        }, 1.22)
        .from(title, {
            y: 34,
            duration: 0.68,
            ease: 'expo.out'
        }, 1.22)
        .to(subtitle, {
            autoAlpha: 1,
            duration: 0.42
        }, 1.52)
        .from(subtitle, {
            y: 16,
            duration: 0.42
        }, 1.52)
        .to(actionButtons, {
            autoAlpha: 1,
            duration: 0.38,
            stagger: 0.08
        }, 1.68)
        .from(actionButtons, {
            y: 12,
            duration: 0.38,
            stagger: 0.08
        }, 1.68)
        .from(stars, {
            scale: 0.35,
            autoAlpha: 0,
            duration: 0.36,
            stagger: 0.08
        }, 1.74);

        return runTimeline(tl);
    }

    function updateControls() {
        variantButtons.forEach(function (button) {
            const isActive = button.dataset.variant === activeVariant;
            button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        speedButtons.forEach(function (button) {
            const speed = Number(button.dataset.speed);
            button.setAttribute('aria-pressed', speed === playbackSpeed ? 'true' : 'false');
        });
    }

    function playVariant(name, updateAddress) {
        if (!allowedVariants.includes(name)) {
            name = 'orbit';
        }

        resetScene();
        activeVariant = name;
        document.body.dataset.motionVariant = name;
        updateControls();

        if (summary) {
            summary.textContent = variants[name].summary + (playbackSpeed === 0.5 ? ' · Reproducción a 0.5×.' : ' · Reproducción normal.');
        }

        if (updateAddress !== false) {
            const url = new URL(window.location.href);
            url.searchParams.set('variant', name);
            url.searchParams.set('speed', String(playbackSpeed));
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

    speedButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            const requestedSpeed = Number(button.dataset.speed);
            playbackSpeed = requestedSpeed === 0.5 ? 0.5 : 1;
            playVariant(activeVariant, true);
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

    const params = new URLSearchParams(window.location.search);
    const requestedVariant = params.get('variant');
    const requestedSpeed = Number(params.get('speed'));
    playbackSpeed = requestedSpeed === 0.5 ? 0.5 : 1;
    playVariant(allowedVariants.includes(requestedVariant) ? requestedVariant : 'orbit', false);
});
