import React from 'react'
import { useTheme } from '@redis-ui/styles'
import { Text } from 'uiSrc/components/base/text'
import NoQueryResultsIcon from 'uiSrc/assets/img/vector-search/no-query-results.svg'
import NoQueryResultsIconDark from 'uiSrc/assets/img/vector-search/no-query-results-dark.svg'

import * as S from './NoSearchResults.styles'

export const NoSearchResults = () => {
  const theme = useTheme()
  const icon =
    theme.name === 'dark' ? NoQueryResultsIconDark : NoQueryResultsIcon

  return (
    <S.Container
      gap="xxl"
      data-testid="no-search-results"
      align="center"
      justify="center"
    >
      <S.Image as="img" src={icon} alt="No search results" />
      <Text size="M">
        Your query results will appear here once you run a query.
      </Text>
    </S.Container>
  )
}
