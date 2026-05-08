import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { act, mockedStore, renderHook } from 'uiSrc/utils/test-utils'
import { stringToBuffer } from 'uiSrc/utils'
import {
  clearSimilaritySearch,
  clearSimilaritySearchPreview,
  fetchVectorSetSimilaritySearch,
  fetchVectorSetSimilaritySearchPreview,
  vectorSetSimilaritySearchPreviewSelector,
  vectorSetSimilaritySearchSelector,
} from 'uiSrc/slices/browser/vectorSet'

import { SimilaritySearchFormState } from '../../similarity-search-form'
import { useSimilaritySearch } from './useSimilaritySearch'

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  selectedKeyDataSelector: jest.fn(),
}))

jest.mock('uiSrc/slices/browser/vectorSet', () => ({
  ...jest.requireActual('uiSrc/slices/browser/vectorSet'),
  vectorSetSimilaritySearchSelector: jest.fn(),
  vectorSetSimilaritySearchPreviewSelector: jest.fn(),
  fetchVectorSetSimilaritySearch: jest.fn(),
  fetchVectorSetSimilaritySearchPreview: jest.fn(),
}))

const KEY_BUFFER = stringToBuffer('mykey')

const baseState = (): SimilaritySearchFormState => ({
  mode: 'vector',
  vectorInput: '',
  elementInput: '',
  count: 10,
  filter: '',
})

const setSelectedKey = (
  data: { name: typeof KEY_BUFFER; vectorDim?: number } | null,
) => {
  ;(selectedKeyDataSelector as jest.Mock).mockReturnValue(data)
}

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

const setSimilaritySearchPreviewState = (
  loading = false,
  preview = '',
  error = '',
) => {
  ;(vectorSetSimilaritySearchPreviewSelector as jest.Mock).mockReturnValue({
    loading,
    error,
    preview,
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockedStore.clearActions()
  setSimilaritySearchState(false)
  setSimilaritySearchPreviewState()
  setSelectedKey({ name: KEY_BUFFER, vectorDim: 3 })
  ;(fetchVectorSetSimilaritySearch as jest.Mock).mockReturnValue({
    type: 'vectorSet/fetchVectorSetSimilaritySearch',
  })
  ;(fetchVectorSetSimilaritySearchPreview as jest.Mock).mockReturnValue({
    type: 'vectorSet/fetchVectorSetSimilaritySearchPreview',
  })
})

describe('useSimilaritySearch', () => {
  it('exposes the loading flag and key vectorDim from selectors', () => {
    setSimilaritySearchState(true)
    setSelectedKey({ name: KEY_BUFFER, vectorDim: 4 })

    const { result } = renderHook(() => useSimilaritySearch())

    expect(result.current.loading).toBe(true)
    expect(result.current.vectorDim).toBe(4)
  })

  describe('results exposure', () => {
    it('reports no results and an empty matches array before any search', () => {
      const { result } = renderHook(() => useSimilaritySearch())

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

      const { result } = renderHook(() => useSimilaritySearch())

      expect(result.current.hasResults).toBe(true)
      expect(result.current.matches).toEqual(elements)
    })
  })

  describe('buildSimilaritySearchPayload', () => {
    it('returns null when no key is selected', () => {
      setSelectedKey(null)

      const { result } = renderHook(() => useSimilaritySearch())

      expect(
        result.current.buildSimilaritySearchPayload({
          ...baseState(),
          vectorInput: '1, 2, 3',
        }),
      ).toBeNull()
    })

    it('builds an ELE payload when mode is element', () => {
      const { result } = renderHook(() => useSimilaritySearch())

      const payload = result.current.buildSimilaritySearchPayload({
        ...baseState(),
        mode: 'element',
        elementInput: 'book-1',
      })

      expect(payload).toEqual({
        keyName: KEY_BUFFER,
        elementName: stringToBuffer('book-1'),
        count: 10,
      })
    })

    it('builds a VALUES payload for numeric vector input', () => {
      const { result } = renderHook(() => useSimilaritySearch())

      const payload = result.current.buildSimilaritySearchPayload({
        ...baseState(),
        vectorInput: '1, 2, 3',
      })

      expect(payload).toEqual({
        keyName: KEY_BUFFER,
        vectorValues: [1, 2, 3],
        count: 10,
      })
    })

    it('builds an FP32 payload (base64) for FP32 escape input', () => {
      setSelectedKey({ name: KEY_BUFFER, vectorDim: 2 })
      const { result } = renderHook(() => useSimilaritySearch())

      const payload = result.current.buildSimilaritySearchPayload({
        ...baseState(),
        vectorInput: '\\x00\\x00\\x80\\x3f\\x00\\x00\\x00\\x40',
      })

      // 8 bytes -> base64 (matches behavior of bytesToBase64 in element form)
      expect(payload).toEqual({
        keyName: KEY_BUFFER,
        vectorFp32: 'AACAPwAAAEA=',
        count: 10,
      })
    })

    it('omits count when null and includes filter when set', () => {
      const { result } = renderHook(() => useSimilaritySearch())

      const payload = result.current.buildSimilaritySearchPayload({
        ...baseState(),
        vectorInput: '1, 2, 3',
        count: null,
        filter: '.price > 50',
      })

      expect(payload).toEqual({
        keyName: KEY_BUFFER,
        vectorValues: [1, 2, 3],
        filter: '.price > 50',
      })
    })

    it('returns null when the vector input does not match vectorDim', () => {
      const { result } = renderHook(() => useSimilaritySearch())

      expect(
        result.current.buildSimilaritySearchPayload({
          ...baseState(),
          vectorInput: '1, 2',
        }),
      ).toBeNull()
    })

    it('returns null when element mode has an empty element name', () => {
      const { result } = renderHook(() => useSimilaritySearch())

      expect(
        result.current.buildSimilaritySearchPayload({
          ...baseState(),
          mode: 'element',
          elementInput: '   ',
        }),
      ).toBeNull()
    })
  })

  describe('clear-on-key-change', () => {
    it('does not dispatch clearSimilaritySearch on initial mount', () => {
      renderHook(() => useSimilaritySearch())

      expect(
        mockedStore
          .getActions()
          .some((a) => a.type === clearSimilaritySearch.type),
      ).toBe(false)
    })
  })

  describe('resetSimilaritySearch', () => {
    it('dispatches clearSimilaritySearch and clearSimilaritySearchPreview', () => {
      const { result } = renderHook(() => useSimilaritySearch())

      act(() => {
        result.current.resetSimilaritySearch()
      })

      const actionTypes = mockedStore.getActions().map((a) => a.type)
      expect(actionTypes).toEqual(
        expect.arrayContaining([
          clearSimilaritySearch.type,
          clearSimilaritySearchPreview.type,
        ]),
      )
    })
  })

  describe('unmount cleanup', () => {
    it('clears the search and preview slices when the consumer unmounts', () => {
      const { unmount } = renderHook(() => useSimilaritySearch())

      mockedStore.clearActions()

      unmount()

      const actionTypes = mockedStore.getActions().map((a) => a.type)
      expect(actionTypes).toEqual(
        expect.arrayContaining([
          clearSimilaritySearch.type,
          clearSimilaritySearchPreview.type,
        ]),
      )
    })
  })

  describe('runSimilaritySearch', () => {
    it('dispatches fetchVectorSetSimilaritySearch with the mapped payload', () => {
      const { result } = renderHook(() => useSimilaritySearch())

      result.current.runSimilaritySearch({
        ...baseState(),
        vectorInput: '1, 2, 3',
      })

      expect(fetchVectorSetSimilaritySearch).toHaveBeenCalledTimes(1)
      expect(fetchVectorSetSimilaritySearch).toHaveBeenCalledWith({
        keyName: KEY_BUFFER,
        vectorValues: [1, 2, 3],
        count: 10,
      })
      expect(mockedStore.getActions()).toEqual([
        { type: 'vectorSet/fetchVectorSetSimilaritySearch' },
      ])
    })

    it('does not dispatch when the form state cannot be mapped to a payload', () => {
      const { result } = renderHook(() => useSimilaritySearch())

      result.current.runSimilaritySearch(baseState())

      expect(fetchVectorSetSimilaritySearch).not.toHaveBeenCalled()
      expect(mockedStore.getActions()).toEqual([])
    })
  })

  describe('preview', () => {
    it('exposes the preview string from the slice selector', () => {
      setSimilaritySearchPreviewState(false, 'VSIM mykey VALUES <vector>')

      const { result } = renderHook(() => useSimilaritySearch())

      expect(result.current.preview).toBe('VSIM mykey VALUES <vector>')
    })

    describe('runSimilaritySearchPreview (debounced)', () => {
      beforeEach(() => {
        jest.useFakeTimers()
      })
      afterEach(() => {
        jest.useRealTimers()
      })

      it('debounces and dispatches a single fetchVectorSetSimilaritySearchPreview', () => {
        const { result } = renderHook(() => useSimilaritySearch())

        act(() => {
          result.current.runSimilaritySearchPreview({
            ...baseState(),
            vectorInput: '1',
          })
          result.current.runSimilaritySearchPreview({
            ...baseState(),
            vectorInput: '1, 2',
          })
          result.current.runSimilaritySearchPreview({
            ...baseState(),
            vectorInput: '1, 2, 3',
          })
        })

        expect(fetchVectorSetSimilaritySearchPreview).not.toHaveBeenCalled()

        act(() => {
          jest.advanceTimersByTime(300)
        })

        expect(fetchVectorSetSimilaritySearchPreview).toHaveBeenCalledTimes(1)
        expect(fetchVectorSetSimilaritySearchPreview).toHaveBeenCalledWith(
          expect.objectContaining({
            keyName: KEY_BUFFER,
            vectorValues: [1, 2, 3],
          }),
        )
        expect(
          (fetchVectorSetSimilaritySearchPreview as jest.Mock).mock.calls[0][0],
        ).not.toHaveProperty('mode')
      })

      it('clears the preview and skips dispatch when the form is invalid', () => {
        const { result } = renderHook(() => useSimilaritySearch())

        act(() => {
          result.current.runSimilaritySearchPreview(baseState())
          jest.advanceTimersByTime(300)
        })

        expect(fetchVectorSetSimilaritySearchPreview).not.toHaveBeenCalled()
        expect(
          mockedStore
            .getActions()
            .some((a) => a.type === clearSimilaritySearchPreview.type),
        ).toBe(true)
      })

      it('cancels a pending preview request when the form becomes invalid mid-debounce', () => {
        const { result } = renderHook(() => useSimilaritySearch())

        act(() => {
          result.current.runSimilaritySearchPreview({
            ...baseState(),
            vectorInput: '1, 2, 3',
          })
        })

        act(() => {
          result.current.runSimilaritySearchPreview({
            ...baseState(),
            vectorInput: '1, 2',
          })
          jest.advanceTimersByTime(300)
        })

        expect(fetchVectorSetSimilaritySearchPreview).not.toHaveBeenCalled()
        expect(
          mockedStore
            .getActions()
            .some((a) => a.type === clearSimilaritySearchPreview.type),
        ).toBe(true)
      })

      it('dispatches the same payload shape as the search endpoint for element mode', () => {
        const { result } = renderHook(() => useSimilaritySearch())

        act(() => {
          result.current.runSimilaritySearchPreview({
            ...baseState(),
            mode: 'element',
            elementInput: 'book-1',
          })
          jest.advanceTimersByTime(300)
        })

        expect(fetchVectorSetSimilaritySearchPreview).toHaveBeenCalledWith(
          expect.objectContaining({
            keyName: KEY_BUFFER,
            elementName: stringToBuffer('book-1'),
          }),
        )
      })
    })
  })
})
