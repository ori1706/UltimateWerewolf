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

const initPromise = i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

export function applyRtl(locale: AppLocale): void {
  const isRtl = locale === 'he';
  if (I18nManager.isRTL !== isRtl) {
    I18nManager.allowRTL(isRtl);
    I18nManager.forceRTL(isRtl);
  }
}

/** Merge latest locale files (helps dev hot reload pick up new keys). */
export function refreshTranslationResources(): void {
  for (const [lng, bundle] of Object.entries(resources) as [AppLocale, { translation: typeof en }][]) {
    i18n.addResourceBundle(lng, 'translation', bundle.translation, true, true);
  }
}

export async function setAppLocale(locale: AppLocale): Promise<void> {
  await initPromise;
  applyRtl(locale);
  refreshTranslationResources();
  if (i18n.language !== locale) {
    await i18n.changeLanguage(locale);
  }
}

export { i18n };
export default i18n;
