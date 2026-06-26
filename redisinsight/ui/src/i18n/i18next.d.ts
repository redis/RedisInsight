import 'i18next'

import { DEFAULT_NAMESPACE } from './i18n.constants'
import en from './locales/en.json'

// Type-safe keys come from augmenting i18next with the source-of-truth
// `en.json` — no codegen. As keys are added to en.json, `t()` autocompletes
// and rejects unknown keys.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof DEFAULT_NAMESPACE
    resources: {
      translation: typeof en
    }
  }
}
