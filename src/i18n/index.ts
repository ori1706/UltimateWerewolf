import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import { en } from './locales/en';
import { he } from './locales/he';

export type AppLocale = 'en' | 'he';

const resources = {
  en: { translation: en },
  he: { translation: he },
};

export function applyRtl(locale: AppLocale): void {
  const isRtl = locale === 'he';
  if (I18nManager.isRTL !== isRtl) {
    I18nManager.allowRTL(isRtl);
    I18nManager.forceRTL(isRtl);
  }
}

export function initI18n(locale: AppLocale = 'en'): typeof i18n {
  applyRtl(locale);

  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      resources,
      lng: locale,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      compatibilityJSON: 'v4',
    });
  } else {
    i18n.changeLanguage(locale);
  }

  return i18n;
}

export { i18n };
export default i18n;
