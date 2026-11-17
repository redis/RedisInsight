import { defineConfig } from 'i18next-cli'

// Config for `npm run i18n:extract` — scans t() usages in the UI and syncs keys
// into the locale files. en is the source of truth; bg gets the same keys with
// empty values to translate.
export default defineConfig({
  locales: ['en', 'bg'],
  extract: {
    input: ['redisinsight/ui/src/**/*.{ts,tsx}'],
    ignore: ['**/node_modules/**', '**/*.d.ts', '**/*.spec.{ts,tsx}'],
    // Single flat JSON per language (no namespace nesting) — matches how
    // i18n.ts loads each file as the `translation` namespace.
    output: 'redisinsight/ui/src/i18n/locales/{{language}}.json',
    defaultNS: false,
    keySeparator: false,
    nsSeparator: false,
    primaryLanguage: 'en',
    secondaryLanguages: ['bg'],
    sort: true,
    // Keep keys whose t() calls were removed, so translations aren't lost.
    removeUnusedKeys: false,
  },
})
