import React from 'react'

import { Text } from 'uiSrc/components/base/text'
import { Col } from 'uiSrc/components/base/layout/flex'

import * as S from '../styles'

/**
 * Vector Search Create Index page placeholder.
 * Will be enhanced later per RI-7920.
 */
export const VectorSearchCreateIndexPage = () => (
  <S.PageWrapper data-testid="vector-search-create-index-page">
    <Col align="center" justify="center">
      <Text size="L">Create Index</Text>
      <Text size="S">Create index form will be implemented here.</Text>
    </Col>
  </S.PageWrapper>
)
