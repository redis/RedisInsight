import React from 'react'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import NoQueryResultsIcon from 'uiSrc/assets/img/vector-search/no-query-results.svg'

import * as S from './NoSearchResults.styles'

export const NoSearchResults = () => (
  <S.Container
    gap="xxl"
    data-testid="no-search-results"
    align="center"
    justify="center"
  >
    <S.Image as="img" src={NoQueryResultsIcon} alt="No search results" />
    <Col gap="m">
      <Text size="M">
        Your query results will appear here once you run a query.
      </Text>
    </Col>
  </S.Container>
)
