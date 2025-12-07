import React from 'react'

import { useSelector } from 'react-redux'
import { SearchMode } from 'uiSrc/slices/interfaces/keys'

import {
  FullScanNoResultsFoundText,
  LoadingText,
  NoResultsFoundText,
  NoSelectedIndexText,
  ScanNoResultsFoundText,
} from 'uiSrc/constants/texts'
import { keysSelector } from 'uiSrc/slices/browser/keys'
import { redisearchSelector } from 'uiSrc/slices/browser/redisearch'

import NoKeysFound from '../no-keys-found'

export interface Props {
  isLoading: boolean
  total: number
  scanned: number
  onAddKeyPanel: (value: boolean) => void
}

const NoKeysMessage = (props: Props) => {
  const { total, scanned, onAddKeyPanel, isLoading } = props

  const { selectedIndex, isSearched: redisearchIsSearched } =
    useSelector(redisearchSelector)
  const {
    isSearched: patternIsSearched,
    isFiltered,
    searchMode,
  } = useSelector(keysSelector)

  if (searchMode === SearchMode.Redisearch) {
    if (!selectedIndex) {
      return NoSelectedIndexText
    }

    if (isLoading) {
      return LoadingText
    }

    if (total === 0) {
      return NoResultsFoundText
    }

    if (redisearchIsSearched) {
      return scanned < total ? NoResultsFoundText : FullScanNoResultsFoundText
    }
  }

  if (isLoading) {
    return LoadingText
  }

  if (total === 0) {
    return <NoKeysFound onAddKeyPanel={onAddKeyPanel} />
  }

  if (patternIsSearched) {
    return scanned < total ? ScanNoResultsFoundText : FullScanNoResultsFoundText
  }

  if (isFiltered && scanned < total) {
    return ScanNoResultsFoundText
  }

  return NoResultsFoundText
}

export default NoKeysMessage
