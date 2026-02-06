import React from 'react'
import { useParams } from 'react-router-dom'

import { Text } from 'uiSrc/components/base/text'
import { Col } from 'uiSrc/components/base/layout/flex'

import * as S from '../styles'
import { VectorSearchQueryPageParams } from './VectorSearchQueryPage.types'

/**
 * Vector Search Query page placeholder.
 * Will be enhanced later per RI-7913.
 */
export const VectorSearchQueryPage = () => {
  const { indexName } = useParams<VectorSearchQueryPageParams>()

  return (
    <S.PageWrapper data-testid="vector-search-query-page">
      <Col align="center" justify="center" style={{ flex: 1 }}>
        <Text size="L">Query Page</Text>
        <Text size="S">Index: {indexName}</Text>
      </Col>
    </S.PageWrapper>
  )
}
