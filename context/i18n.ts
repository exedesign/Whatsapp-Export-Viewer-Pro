import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from '../locales/en/common.json';
import trCommon from '../locales/tr/common.json';
import ruCommon from '../locales/ru/common.json';
import frCommon from '../locales/fr/common.json';
import esCommon from '../locales/es/common.json';
import ptBrCommon from '../locales/pt-BR/common.json';
import hiCommon from '../locales/hi/common.json';
import idCommon from '../locales/id/common.json';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    detection: {
      order: ['localStorage', 'querystring', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    fallbackLng: 'en',
    supportedLngs: ['tr', 'en', 'ru', 'fr', 'es', 'pt-BR', 'hi', 'id'],
    resources: {
      en: { common: enCommon },
      tr: { common: trCommon },
      ru: { common: ruCommon },
      fr: { common: frCommon },
      es: { common: esCommon },
      'pt-BR': { common: ptBrCommon },
      hi: { common: hiCommon },
      id: { common: idCommon }
    },
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false }
  });

export default i18n;
