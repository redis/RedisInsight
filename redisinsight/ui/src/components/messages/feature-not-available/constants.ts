import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { FeatureNotAvailableContent } from './FeatureNotAvailable.types'

export const FILTER_NOT_AVAILABLE_CONTENT: FeatureNotAvailableContent = {
  testId: 'filter-not-available',
  title: 'Upgrade your Redis database to version 6 or above',
  description: 'Filtering by data type is supported in Redis 6 and above.',
  freeInstanceText:
    'Use your free all-in-one Redis Cloud database to start exploring these capabilities.',
  noInstanceText:
    'Create a free Redis Cloud database that supports filtering and extends the core capabilities of your Redis.',
  oauthSource: OAuthSocialSource.BrowserFiltering,
}

export const REDISEARCH_VERSION_REQUIRED_CONTENT: FeatureNotAvailableContent = {
  testId: 'redisearch-version-required',
  title: 'Redis Query Engine 2.0+ required',
  description:
    'This feature requires Redis Query Engine 2.0 or later (included with Redis 6+). ' +
    'Older versions of the query engine are not compatible with the commands used here.',
  freeInstanceText:
    'Use your free all-in-one Redis Cloud database to start exploring these capabilities.',
  noInstanceText:
    'Create a free Redis Cloud database to start exploring these capabilities.',
  oauthSource: OAuthSocialSource.BrowserSearch,
}
