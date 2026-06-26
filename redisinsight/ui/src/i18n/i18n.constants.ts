// Languages we ship translations for; add a code + matching locales/<code>.json.
export const SUPPORTED_LANGUAGES = ['en', 'bg'] as const

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

// Initial language and the fallback for missing keys; en.json is the source of truth.
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en'

// The single namespace all keys live under (also augmented in i18next.d.ts).
export const DEFAULT_NAMESPACE = 'translation'
