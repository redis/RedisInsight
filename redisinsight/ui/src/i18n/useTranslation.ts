// Single seam for translation access. App code imports from `uiSrc/i18n`
// rather than `react-i18next` directly, so any future wrapping (custom
// namespaces, defaults) happens in one place.
export { useTranslation, Trans } from 'react-i18next'
