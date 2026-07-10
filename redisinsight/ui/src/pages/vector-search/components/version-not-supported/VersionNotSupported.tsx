import React from 'react'

import {
  SearchPageFallback,
  getVersionNotSupportedContent,
} from '../search-page-fallback'

export const VersionNotSupported = () => (
  <SearchPageFallback content={getVersionNotSupportedContent()} />
)
