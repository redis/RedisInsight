import { Factory } from 'fishery'

import { UseSimilaritySearchResult } from 'uiSrc/pages/browser/modules/key-details/components/vector-set-details/hooks/useSimilaritySearch/useSimilaritySearch.types'

/**
 * Builds a stub return value for `useSimilaritySearch`. Defaults to a quiet,
 * not-yet-run state (no loading flags, empty preview, undefined dim) and
 * fresh `jest.fn()` instances for every action so callers can assert on
 * specific invocations without sharing call history across tests.
 *
 * Usage:
 *   useSimilaritySearchResultFactory.build()
 *   useSimilaritySearchResultFactory.build({ vectorDim: 3 })
 *   useSimilaritySearchResultFactory.build({ runSimilaritySearch: myFn })
 */
export const useSimilaritySearchResultFactory =
  Factory.define<UseSimilaritySearchResult>(() => ({
    loading: false,
    previewLoading: false,
    vectorDim: undefined,
    preview: '',
    runSimilaritySearch: jest.fn(),
    runSimilaritySearchPreview: jest.fn(),
    resetSimilaritySearch: jest.fn(),
    buildSimilaritySearchPayload: jest.fn(),
  }))
