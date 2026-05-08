import { renderHook } from 'uiSrc/utils/test-utils'
import { stringToBuffer } from 'uiSrc/utils'
import { vectorSetSimilaritySearchSelector } from 'uiSrc/slices/browser/vectorSet'

import { useSimilaritySearchResults } from './useSimilaritySearchResults'

jest.mock('uiSrc/slices/browser/vectorSet', () => ({
  ...jest.requireActual('uiSrc/slices/browser/vectorSet'),
  vectorSetSimilaritySearchSelector: jest.fn(),
}))

const KEY_BUFFER = stringToBuffer('mykey')

const setSimilaritySearchState = (
  loading: boolean,
  data?: {
    keyName: typeof KEY_BUFFER
    elements: { name: any; score: number }[]
  },
) => {
  ;(vectorSetSimilaritySearchSelector as jest.Mock).mockReturnValue({
    loading,
    error: '',
    data,
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  setSimilaritySearchState(false)
})

describe('useSimilaritySearchResults', () => {
  it('reports no results and an empty matches array before any search', () => {
    const { result } = renderHook(() => useSimilaritySearchResults())

    expect(result.current.hasResults).toBe(false)
    expect(result.current.matches).toEqual([])
  })

  it('exposes hasResults and matches when search data is loaded', () => {
    const elements = [
      { name: stringToBuffer('alpha'), score: 0.9 },
      { name: stringToBuffer('beta'), score: 0.5 },
    ]
    setSimilaritySearchState(false, {
      keyName: KEY_BUFFER,
      elements,
    })

    const { result } = renderHook(() => useSimilaritySearchResults())

    expect(result.current.hasResults).toBe(true)
    expect(result.current.matches).toEqual(elements)
  })
})
