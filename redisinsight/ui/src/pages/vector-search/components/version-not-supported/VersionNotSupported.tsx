import React from 'react'

import {
  SearchPageFallback,
  VERSION_NOT_SUPPORTED_CONTENT,
} from '../search-page-fallback'

export const VersionNotSupported = () => (
  <SearchPageFallback content={VERSION_NOT_SUPPORTED_CONTENT} />
)
