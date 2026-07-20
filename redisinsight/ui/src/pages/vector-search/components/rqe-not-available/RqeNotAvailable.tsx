import React from 'react'

import {
  SearchPageFallback,
  getRqeNotAvailableContent,
} from '../search-page-fallback'

export const RqeNotAvailable = () => (
  <SearchPageFallback content={getRqeNotAvailableContent()} />
)
