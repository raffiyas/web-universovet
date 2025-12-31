/* ============================================
   UNIVERSOVET - JAVASCRIPT
   Landing Page para Clínica Veterinaria
   ============================================ */

/**
 * Espera a que el DOM esté completamente cargado
 * antes de ejecutar cualquier script
 */
document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ============================================
    // 1. CONFIGURACIÓN Y VARIABLES GLOBALES
    // ============================================
    
    /**
     * Número de WhatsApp para los CTAs
     * IMPORTANTE: Cambiar este número por el real de la clínica
     * Formato: código de país + número (sin espacios ni símbolos)
     */
    const WHATSAPP_NUMBER = '56900000000';
    const WHATSAPP_MESSAGE = 'Hola, quiero agendar una cita en UniversoVet';
    
    // Selectores de elementos
    const header = document.getElementById('header');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const scrollTopBtn = document.getElementById('scroll-top');
    const currentYearSpan = document.getElementById('current-year');
    const navLinks = document.querySelectorAll('.nav__link');
    
    // ============================================
    // 2. FUNCIONES DE UTILIDAD
    // ============================================
    
    /**
     * Actualiza el año actual en el footer
     */
    function updateCurrentYear() {
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }
    }
    
    /**
     * Genera un enlace de WhatsApp con mensaje predefinido
     * @param {string} phone - Número de teléfono
     * @param {string} message - Mensaje a enviar
     * @returns {string} URL de WhatsApp
     */
    function generateWhatsAppLink(phone, message) {
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${phone}?text=${encodedMessage}`;
    }
    
    /**
     * Actualiza todos los enlaces de WhatsApp en la página
     */
    function updateWhatsAppLinks() {
        const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');
        const newLink = generateWhatsAppLink(WHATSAPP_NUMBER, WHATSAPP_MESSAGE);
        
        whatsappLinks.forEach(function(link) {
            link.href = newLink;
        });
    }
    
    // ============================================
    // 3. NAVEGACIÓN MÓVIL
    // ============================================
    
    /**
     * Alterna el menú de navegación móvil
     */
    function toggleMobileMenu() {
        navToggle.classList.toggle('nav__toggle--active');
        navMenu.classList.toggle('nav__menu--open');
        
        // Prevenir scroll del body cuando el menú está abierto
        document.body.style.overflow = navMenu.classList.contains('nav__menu--open') ? 'hidden' : '';
    }
    
    /**
     * Cierra el menú móvil
     */
    function closeMobileMenu() {
        navToggle.classList.remove('nav__toggle--active');
        navMenu.classList.remove('nav__menu--open');
        document.body.style.overflow = '';
    }
    
    // Event listener para el botón hamburguesa
    if (navToggle) {
        navToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Cerrar menú al hacer clic en un enlace
    navLinks.forEach(function(link) {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Cerrar menú al hacer clic fuera de él
    document.addEventListener('click', function(event) {
        const isClickInsideMenu = navMenu.contains(event.target);
        const isClickOnToggle = navToggle.contains(event.target);
        
        if (!isClickInsideMenu && !isClickOnToggle && navMenu.classList.contains('nav__menu--open')) {
            closeMobileMenu();
        }
    });
    
    // ============================================
    // 4. HEADER SCROLL EFFECT
    // ============================================
    
    /**
     * Añade clase al header cuando se hace scroll
     */
    function handleHeaderScroll() {
        const scrollY = window.scrollY;
        
        if (scrollY > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
    }
    
    // ============================================
    // 5. BOTÓN SCROLL TO TOP
    // ============================================
    
    /**
     * Muestra/oculta el botón de scroll to top
     */
    function handleScrollTopVisibility() {
        const scrollY = window.scrollY;
        
        if (scrollY > 400) {
            scrollTopBtn.classList.add('scroll-top--visible');
        } else {
            scrollTopBtn.classList.remove('scroll-top--visible');
        }
    }
    
    /**
     * Hace scroll suave hacia arriba
     */
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // Event listener para el botón scroll to top
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', scrollToTop);
    }
    
    // ============================================
    // 6. SMOOTH SCROLL PARA ENLACES INTERNOS
    // ============================================
    
    /**
     * Implementa scroll suave para enlaces con hash
     */
    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(event) {
                const targetId = this.getAttribute('href');
                
                // Ignorar si es solo "#"
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    event.preventDefault();
                    
                    // Calcular offset por el header fijo
                    const headerHeight = header ? header.offsetHeight : 0;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    // ============================================
    // 7. ANIMACIONES DE ENTRADA (Intersection Observer)
    // ============================================
    
    /**
     * Configura las animaciones de entrada para elementos
     * cuando entran en el viewport
     */
    function setupScrollAnimations() {
        // Elementos a animar
        const animatedElements = document.querySelectorAll(
            '.feature-card, .service-card, .section__header, .trust__content, .cta__content'
        );
        
        // Añadir clase inicial para animación
        animatedElements.forEach(function(element) {
            element.classList.add('fade-in');
        });
        
        // Configuración del observer
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        };
        
        // Callback del observer
        const observerCallback = function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    // Añadir delay escalonado para cards
                    const parent = entry.target.parentElement;
                    if (parent && (parent.classList.contains('features__grid') || parent.classList.contains('services__grid'))) {
                        const siblings = Array.from(parent.children);
                        const index = siblings.indexOf(entry.target);
                        entry.target.style.transitionDelay = (index * 0.1) + 's';
                    }
                    
                    entry.target.classList.add('fade-in--visible');
                    observer.unobserve(entry.target);
                }
            });
        };
        
        // Crear observer
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        
        // Observar elementos
        animatedElements.forEach(function(element) {
            observer.observe(element);
        });
    }
    
    // ============================================
    // 8. ACTIVE LINK HIGHLIGHTING
    // ============================================
    
    /**
     * Resalta el enlace de navegación activo basándose en la sección visible
     */
    function setupActiveNavHighlight() {
        const sections = document.querySelectorAll('section[id]');
        
        function highlightActiveSection() {
            const scrollY = window.scrollY;
            
            sections.forEach(function(section) {
                const sectionHeight = section.offsetHeight;
                const sectionTop = section.offsetTop - 100;
                const sectionId = section.getAttribute('id');
                
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLinks.forEach(function(link) {
                        link.classList.remove('nav__link--active');
                        if (link.getAttribute('href') === '#' + sectionId) {
                            link.classList.add('nav__link--active');
                        }
                    });
                }
            });
        }
        
        window.addEventListener('scroll', highlightActiveSection);
    }
    
    // ============================================
    // 9. EVENT LISTENERS GLOBALES
    // ============================================
    
    /**
     * Handler optimizado para eventos de scroll
     * Usa requestAnimationFrame para mejor rendimiento
     */
    let ticking = false;
    
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                handleHeaderScroll();
                handleScrollTopVisibility();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // ============================================
    // 10. INICIALIZACIÓN
    // ============================================
    
    /**
     * Inicializa todas las funcionalidades
     */
    function init() {
        // Actualizar año
        updateCurrentYear();
        
        // Configurar enlaces de WhatsApp
        updateWhatsAppLinks();
        
        // Configurar smooth scroll
        setupSmoothScroll();
        
        // Configurar animaciones
        setupScrollAnimations();
        
        // Configurar highlight de navegación
        setupActiveNavHighlight();
        
        // Ejecutar handlers iniciales
        handleHeaderScroll();
        handleScrollTopVisibility();
        
        // Log de confirmación (remover en producción)
        console.log('UniversoVet - Landing page inicializada correctamente');
    }
    
    // Ejecutar inicialización
    init();
    
});

// ============================================
// 11. FUNCIONES ADICIONALES (Opcional)
// ============================================

/**
 * Función para validación de formulario de contacto
 * (Para uso futuro si se añade un formulario)
 * @param {HTMLFormElement} form - Elemento del formulario
 * @returns {boolean} - true si es válido
 */
function validateContactForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(function(field) {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('field--error');
        } else {
            field.classList.remove('field--error');
        }
    });
    
    return isValid;
}

/**
 * Función para mostrar notificaciones toast
 * (Para uso futuro)
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo: 'success', 'error', 'info'
 */
function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = 'toast toast--' + type;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Mostrar con animación
    setTimeout(function() {
        toast.classList.add('toast--visible');
    }, 100);
    
    // Ocultar y eliminar
    setTimeout(function() {
        toast.classList.remove('toast--visible');
        setTimeout(function() {
            toast.remove();
        }, 300);
    }, 3000);
}
