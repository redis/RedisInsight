import React from 'react'

import { useAppSelector } from 'uiSrc/slices/hooks'
import { SearchMode } from 'uiSrc/slices/interfaces/keys'

import { keysSelector } from 'uiSrc/slices/browser/keys'
import { redisearchSelector } from 'uiSrc/slices/browser/redisearch'
import { Text } from 'uiSrc/components/base/text'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Trans, useTranslation } from 'uiSrc/i18n'

import NoKeysFound from '../no-keys-found'

export interface Props {
  isLoading: boolean
  total: number
  scanned: number
  onAddKeyPanel: (value: boolean) => void
}

const NoKeysMessage = (props: Props) => {
  const { total, scanned, onAddKeyPanel, isLoading } = props
  const { t } = useTranslation()

  const { selectedIndex, isSearched: redisearchIsSearched } =
    useAppSelector(redisearchSelector)
  const {
    isSearched: patternIsSearched,
    isFiltered,
    searchMode,
  } = useAppSelector(keysSelector)

  const noResultsFoundText = (
    <Text size="m" data-testid="no-result-found-only">
      {t('browser.noResults.title')}
    </Text>
  )

  const loadingText = (
    <Text size="m" data-testid="loading-keys" style={{ lineHeight: 1.4 }}>
      {t('browser.noResults.loading')}
    </Text>
  )

  const noSelectedIndexText = (
    <Text size="m" data-testid="no-result-select-index">
      {t('browser.noResults.selectIndex')}
    </Text>
  )

  const fullScanNoResultsFoundText = (
    <>
      <Text size="m" data-test-subj="no-result-found">
        {t('browser.noResults.title')}
      </Text>
      <Spacer size="m" />
      <Text size="s" data-test-subj="search-advices">
        <Trans
          i18nKey="browser.noResults.advices"
          components={{ lineBreak: <br /> }}
        />
      </Text>
    </>
  )

  const scanNoResultsFoundText = (
    <>
      <Text size="m" data-testid="scan-no-results-found">
        {t('browser.noResults.title')}
      </Text>
      <br />
      <Text size="s">{t('browser.noResults.scanMore')}</Text>
    </>
  )

  if (searchMode === SearchMode.Redisearch) {
    if (!selectedIndex) {
      return noSelectedIndexText
    }

    if (isLoading) {
      return loadingText
    }

    if (total === 0) {
      return noResultsFoundText
    }

    if (redisearchIsSearched) {
      return scanned < total ? noResultsFoundText : fullScanNoResultsFoundText
    }
  }

  if (isLoading) {
    return loadingText
  }

  if (total === 0) {
    return <NoKeysFound onAddKeyPanel={onAddKeyPanel} />
  }

  if (patternIsSearched) {
    return scanned < total ? scanNoResultsFoundText : fullScanNoResultsFoundText
  }

  if (isFiltered && scanned < total) {
    return scanNoResultsFoundText
  }

  return noResultsFoundText
}

export default NoKeysMessage
