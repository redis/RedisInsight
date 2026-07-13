import i18n from 'uiSrc/i18n'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { SearchPageFallbackContent } from './SearchPageFallback.types'

// Built at call time (not module scope) so copy resolves in the active
// language when the fallback renders.
export const getRqeNotAvailableContent = (): SearchPageFallbackContent => ({
  testId: 'rqe-not-available',
  title: i18n.t('vectorSearch.notAvailable.title'),
  subtitle: i18n.t('vectorSearch.notAvailable.subtitle'),
  features: [
    i18n.t('vectorSearch.notAvailable.feature.query'),
    i18n.t('vectorSearch.notAvailable.feature.secondaryIndex'),
    i18n.t('vectorSearch.notAvailable.feature.fullTextSearch'),
  ],
  description: i18n.t('vectorSearch.notAvailable.description'),
  ctaText: i18n.t('vectorSearch.notAvailable.ctaText'),
  oauthSource: OAuthSocialSource.BrowserSearch,
})

export const getVersionNotSupportedContent = (): SearchPageFallbackContent => ({
  testId: 'version-not-supported',
  title: i18n.t('vectorSearch.versionNotSupported.title'),
  description: i18n.t('vectorSearch.versionNotSupported.description'),
  ctaText: i18n.t('vectorSearch.versionNotSupported.ctaText'),
  oauthSource: OAuthSocialSource.BrowserFiltering,
})
