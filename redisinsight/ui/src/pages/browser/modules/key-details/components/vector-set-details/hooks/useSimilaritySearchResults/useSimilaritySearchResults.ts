import { useAppSelector } from 'uiSrc/slices/hooks'

import { vectorSetSimilaritySearchSelector } from 'uiSrc/slices/browser/vectorSet'
import { VectorSetSimilarityMatch } from 'uiSrc/slices/interfaces/vectorSet'

import { UseSimilaritySearchResultsResult } from './useSimilaritySearchResults.types'

const EMPTY_MATCHES: VectorSetSimilarityMatch[] = []

export const useSimilaritySearchResults =
  (): UseSimilaritySearchResultsResult => {
    const { data } = useAppSelector(vectorSetSimilaritySearchSelector)

    const matches = data?.elements ?? EMPTY_MATCHES
    const hasResults = data !== undefined

    return {
      matches,
      hasResults,
    }
  }
