const languageSelector = document.getElementById('language-selector');
const languageOptions = document.getElementById('language-options');

const BASE_LANG = 'es';
const translationsCache = {};

function getNestedValue(obj, key) {
    return key.split('.').reduce((prev, curr) => {
        return prev ? prev[curr] : null;
    }, obj);
}

async function loadTranslations(lang) {
    if (translationsCache[lang]) {
        return translationsCache[lang];
    }

    try {
        const response = await fetch(`i18n/${lang}.json`);
        if (!response.ok) throw new Error(`Failed to load ${lang}.json`);

        const data = await response.json();
        translationsCache[lang] = data;
        return data;
    } catch (error) {
        console.error('Error loading translations:', error);
        return null;
    }
}

async function updateContent(lang) {
    try {
        const baseTranslations = await loadTranslations(BASE_LANG);
        const translations = lang === BASE_LANG
            ? baseTranslations
            : await loadTranslations(lang);

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

        // Update active state in dropdown
        document.querySelectorAll('.lang-option').forEach(option => {
            if (option.getAttribute('data-lang') === lang) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });

        localStorage.setItem('preferredLanguage', lang);
        document.documentElement.lang = lang;

        languageOptions.classList.remove('show');
        languageSelector.classList.remove('active');
    } catch (error) {
        console.error('Error updating content:', error);
    }
}

languageSelector.addEventListener('click', (e) => {
    e.stopPropagation();
    languageOptions.classList.toggle('show');
    languageSelector.classList.toggle('active');
});

document.addEventListener('click', () => {
    languageOptions.classList.remove('show');
    languageSelector.classList.remove('active');
});

document.querySelectorAll('.lang-option').forEach(option => {
    option.addEventListener('click', function (e) {
        const lang = this.getAttribute('data-lang');
        updateContent(lang);
    });
});

const SUPPORTED_LANGS = ['es', 'en'];

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && SUPPORTED_LANGS.includes(savedLang)) {
        updateContent(savedLang);
    } else {
        const browserLang = navigator.language.split('-')[0];
        const defaultLang = SUPPORTED_LANGS.includes(browserLang) ? browserLang : 'en';
        updateContent(defaultLang);
    }
});
