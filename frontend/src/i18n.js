import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import rw from './locales/rw.json';
import fr from './locales/fr.json';
import sw from './locales/sw.json';

const STAFF_ROLES = ['admin', 'director', 'dod', 'director_of_discipline', 'accountant', 'stock_manager', 'registrar', 'teacher', 'librarian'];
const SUPPORTED_LANGS = ['en', 'rw', 'fr', 'sw'];

// Compute the default language at startup based on the persisted user role.
// Public visitors → Kinyarwanda (rw). Staff/role users → English (en).
// User's explicit language preference (saved under i18nextLng) always wins
// because it's resolved by the LanguageDetector before falling back to `lng`.
const computeDefaultLanguage = () => {
    try {
        const saved = localStorage.getItem('i18nextLng');
        if (saved && SUPPORTED_LANGS.includes(saved)) return saved;

        const rawUser = localStorage.getItem('user');
        if (rawUser) {
            const user = JSON.parse(rawUser);
            if (user && user.role && STAFF_ROLES.includes(user.role)) {
                return 'en';
            }
        }
    } catch {
        // ignore — fall back to rw
    }
    return 'rw';
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            rw: { translation: rw },
            fr: { translation: fr },
            sw: { translation: sw },
        },
        lng: computeDefaultLanguage(),
        fallbackLng: 'rw',
        supportedLngs: SUPPORTED_LANGS,
        nonExplicitSupportedLngs: true,
        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nextLng',
        },
        interpolation: {
            escapeValue: false,
        },
    });

// Helper: switch language to English when a staff role logs in (only if the user
// has not yet picked a language explicitly).
export const applyDefaultLanguageForRole = (role) => {
    try {
        const saved = localStorage.getItem('i18nextLng');
        if (saved && SUPPORTED_LANGS.includes(saved)) return; // honour user choice
        if (role && STAFF_ROLES.includes(role)) {
            i18n.changeLanguage('en');
        } else {
            i18n.changeLanguage('rw');
        }
    } catch {}
};

export default i18n;
