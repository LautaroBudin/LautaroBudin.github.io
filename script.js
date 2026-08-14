/**
 * CYBERNETIC KINETIC OS // RUNTIME CONTROLLER
 * Handles i18n Localization, Aperture Navigation, Modal Systems, and Keyboard Commands.
 */

const BASE_LANG = 'es';
const SUPPORTED_LANGS = ['es', 'en'];
const translationsCache = {};

// Helper: Traverse nested JSON keys like "header.role"
function getNestedValue(obj, key) {
    if (!obj || !key) return null;
    return key.split('.').reduce((prev, curr) => (prev ? prev[curr] : null), obj);
}

// Load Translation JSON from i18n/
async function loadTranslations(lang) {
    if (translationsCache[lang]) {
        return translationsCache[lang];
    }
    try {
        const response = await fetch(`i18n/${lang}.json`);
        if (!response.ok) throw new Error(`Failed to load i18n/${lang}.json`);
        const data = await response.json();
        translationsCache[lang] = data;
        return data;
    } catch (error) {
        console.error('Translation loading error:', error);
        return null;
    }
}

// Update DOM elements matching [data-i18n]
async function updateContent(lang) {
    try {
        const baseTranslations = await loadTranslations(BASE_LANG);
        const translations = lang === BASE_LANG ? baseTranslations : await loadTranslations(lang);

        if (!baseTranslations) return;

        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const value =
                (translations ? getNestedValue(translations, key) : null) ??
                getNestedValue(baseTranslations, key);

            if (value !== null && value !== undefined) {
                element.textContent = value;
            }
        });

        localStorage.setItem('preferredLanguage', lang);
        document.documentElement.lang = lang;
    } catch (error) {
        console.error('Content update error:', error);
    }
}

// Modal Management
function openBioModal() {
    const modal = document.getElementById('provenance-modal');
    if (modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }
}

function closeBioModal() {
    const modal = document.getElementById('provenance-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    // 1. Language Initialization
    const savedLang = localStorage.getItem('preferredLanguage');
    const browserLang = navigator.language ? navigator.language.split('-')[0] : 'es';
    let currentLang = savedLang && SUPPORTED_LANGS.includes(savedLang)
        ? savedLang
        : SUPPORTED_LANGS.includes(browserLang) ? browserLang : 'es';

    updateContent(currentLang);

    // Language Toggle Button
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
        langBtn.addEventListener('click', () => {
            currentLang = currentLang === 'es' ? 'en' : 'es';
            updateContent(currentLang);
        });
    }

    // 2. Modal Triggers
    const aboutBtn = document.getElementById('about-trigger-btn');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalBackdrop = document.getElementById('modal-backdrop');

    if (aboutBtn) aboutBtn.addEventListener('click', openBioModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeBioModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeBioModal);

    // 3. Keyboard Commands
    document.addEventListener('keydown', (e) => {
        // ESC -> Close Modal
        if (e.key === 'Escape') {
            closeBioModal();
        }

        // Ignore hotkeys when typing in inputs/textareas
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

        // Key 'A' -> Toggle About Modal
        if (e.key === 'a' || e.key === 'A') {
            const modal = document.getElementById('provenance-modal');
            if (modal && modal.classList.contains('active')) {
                closeBioModal();
            } else {
                openBioModal();
            }
        }

        // Key 'L' -> Toggle Language
        if (e.key === 'l' || e.key === 'L') {
            currentLang = currentLang === 'es' ? 'en' : 'es';
            updateContent(currentLang);
        }

        // Numbers 1, 2, 3 -> Focus Apertures
        if (['1', '2', '3'].includes(e.key)) {
            const target = document.getElementById(`aperture-0${e.key}`);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                target.style.outline = '1px solid #0038FF';
                setTimeout(() => { target.style.outline = 'none'; }, 800);
            }
        }
    });
});
