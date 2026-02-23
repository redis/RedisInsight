import React from 'react'

import { QueryLibraryDebug } from '../../components/QueryLibraryDebug/QueryLibraryDebug'

import * as S from '../styles'

/**
 * Vector Search Query page placeholder.
 * Will be enhanced later per RI-7913.
 */
export const VectorSearchQueryPage = () => (
  <S.PageWrapper data-testid="vector-search-query-page">
    <QueryLibraryDebug />
  </S.PageWrapper>
)
