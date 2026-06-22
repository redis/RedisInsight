import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import {
  DEFAULT_LANGUAGE,
  DEFAULT_NAMESPACE,
  SUPPORTED_LANGUAGES,
} from './i18n.constants'
import en from './locales/en.json'
import bg from './locales/bg.json'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    bg: { translation: bg },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: [...SUPPORTED_LANGUAGES],
  ns: [DEFAULT_NAMESPACE],
  defaultNS: DEFAULT_NAMESPACE,
  // Flat keys (dots are literal, not nesting) — matches i18next.config.mjs.
  keySeparator: false,
  nsSeparator: false,
  interpolation: {
    // React already escapes values, so disable i18next's own escaping.
    escapeValue: false,
  },
})

export default i18n
