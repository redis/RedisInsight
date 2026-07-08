import React from 'react'

import {
  SearchPageFallback,
  REDIS_SEARCH_NOT_AVAILABLE_CONTENT,
} from '../search-page-fallback'

export const RedisSearchNotAvailable = () => (
  <SearchPageFallback content={REDIS_SEARCH_NOT_AVAILABLE_CONTENT} />
)
