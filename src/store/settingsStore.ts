import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { appStorage } from '../utils/storage';
import type { AppLocale } from '../i18n';
import { applyRtl, i18n } from '../i18n';

interface SettingsState {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale) => {
        applyRtl(locale);
        i18n.changeLanguage(locale);
        set({ locale });
      },
    }),
    {
      name: 'uw-settings',
      storage: createJSONStorage(() => appStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.locale) {
          applyRtl(state.locale);
          i18n.changeLanguage(state.locale);
        }
      },
    }
  )
);
