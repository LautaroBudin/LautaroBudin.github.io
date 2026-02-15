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
    const presentation = document.getElementById('presentation');
    const gradientTexts = document.querySelectorAll('.gradient-text');
    const cursorGlow = document.querySelector('.cursor-glow');

    if (presentation && cursorGlow) {
        presentation.addEventListener('mousemove', (e) => {
            const rect = presentation.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            cursorGlow.style.setProperty('--glow-x', `${x}px`);
            cursorGlow.style.setProperty('--glow-y', `${y}px`);

            gradientTexts.forEach(text => {
                const textRect = text.getBoundingClientRect();
                if (e.clientX >= textRect.left && e.clientX <= textRect.right &&
                    e.clientY >= textRect.top && e.clientY <= textRect.bottom) {
                    const tx = ((e.clientX - textRect.left) / textRect.width) * 100;
                    const ty = ((e.clientY - textRect.top) / textRect.height) * 100;
                    text.style.setProperty('--x', `${tx}%`);
                    text.style.setProperty('--y', `${ty}%`);
                    text.style.setProperty('--active', '1');
                    cursorGlow.style.opacity = '1';
                } else {
                    text.style.setProperty('--active', '0');
                    cursorGlow.style.opacity = '0';
                }
            });
        });

        presentation.addEventListener('mouseleave', () => {
            cursorGlow.style.opacity = '0';
            gradientTexts.forEach(text => {
                text.style.setProperty('--active', '0');
            });
        });
    }

    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && SUPPORTED_LANGS.includes(savedLang)) {
        updateContent(savedLang);
    } else {
        const browserLang = navigator.language.split('-')[0];
        const defaultLang = SUPPORTED_LANGS.includes(browserLang) ? browserLang : 'en';
        updateContent(defaultLang);
    }

    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    function setTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (themeToggle) {
            themeToggle.checked = theme === 'dark';
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            const newTheme = themeToggle.checked ? 'dark' : 'light';
            setTheme(newTheme);
        });
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        // Default to dark if no saved theme
        setTheme('dark');
    }

    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");

    if (hamburger && navLinks) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navLinks.classList.toggle("active");
        });

        document.querySelectorAll(".nav-links li a").forEach(n => n.addEventListener("click", () => {
            hamburger.classList.remove("active");
            navLinks.classList.remove("active");
        }));
    }

    let scrollThrottle;
    const updateScrollProgress = () => {
        if (scrollThrottle) return;

        scrollThrottle = true;
        requestAnimationFrame(() => {
            const h = document.documentElement,
                b = document.body,
                st = 'scrollTop',
                sh = 'scrollHeight';
            const totalHeight = (h[sh] || b[sh]) - h.clientHeight;
            const scrollPercent = totalHeight > 0 ? (h[st] || b[st]) / totalHeight : 0;
            document.body.style.setProperty('--scroll-percent', scrollPercent);
            scrollThrottle = false;
        });
    };

    window.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress();

    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
});
