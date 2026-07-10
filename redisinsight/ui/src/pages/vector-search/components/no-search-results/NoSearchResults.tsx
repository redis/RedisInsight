import React, { useContext } from 'react'
import { Text } from 'uiSrc/components/base/text'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { Theme } from 'uiSrc/constants'
import { useTranslation } from 'uiSrc/i18n'
import NoQueryResultsIcon from 'uiSrc/assets/img/vector-search/no-query-results.svg'
import NoQueryResultsIconDark from 'uiSrc/assets/img/vector-search/no-query-results-dark.svg'

import * as S from './NoSearchResults.styles'

export const NoSearchResults = () => {
  const { t } = useTranslation()
  const { theme } = useContext(ThemeContext)
  const icon =
    theme === Theme.Dark ? NoQueryResultsIconDark : NoQueryResultsIcon

  return (
    <S.Container
      gap="xxl"
      data-testid="no-search-results"
      align="center"
      justify="center"
    >
      <S.Image as="img" src={icon} alt={t('vectorSearch.noResults.imageAlt')} />
      <Text size="M">{t('vectorSearch.noResults.text')}</Text>
    </S.Container>
  )
}
