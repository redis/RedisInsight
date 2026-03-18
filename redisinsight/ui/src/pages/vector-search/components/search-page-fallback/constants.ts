import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { SearchPageFallbackContent } from './SearchPageFallback.types'

export const RQE_NOT_AVAILABLE_CONTENT: SearchPageFallbackContent = {
  testId: 'rqe-not-available',
  title: 'Redis Query Engine is not available for this database',
  subtitle: 'Redis Query Engine allows to:',
  features: ['Query', 'Secondary index', 'Full-text search'],
  description:
    'These features enable multi-field queries, aggregation, exact phrase matching, numeric filtering, ' +
    'geo filtering and vector similarity semantic search on top of text queries.',
  ctaText:
    'Use your free trial all-in-one Redis Cloud database to start exploring these capabilities',
  oauthSource: OAuthSocialSource.BrowserSearch,
}

export const VERSION_NOT_SUPPORTED_CONTENT: SearchPageFallbackContent = {
  testId: 'version-not-supported',
  title: 'Redis Query Engine 2.0+ required',
  description:
    'This page requires Redis Query Engine 2.0 or later (included with Redis 6+). ' +
    'Older versions of the query engine are not compatible with the commands used here.',
  ctaText:
    'Create a free Redis Cloud database to start exploring these capabilities.',
  oauthSource: OAuthSocialSource.BrowserFiltering,
}
