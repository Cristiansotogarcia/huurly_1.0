import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

export const initI18n = () => {
  if (i18n.isInitialized) return i18n;

  i18n
    .use(HttpBackend)
    .use(initReactI18next)
    .init({
      lng: 'nl',
      fallbackLng: 'en',
      debug: false,
      interpolation: {
        escapeValue: false,
      },
      backend: {
        loadPath: '/locales/{{lng}}/translation.json',
      },
      react: {
        useSuspense: false,
      },
    });

  return i18n;
};
