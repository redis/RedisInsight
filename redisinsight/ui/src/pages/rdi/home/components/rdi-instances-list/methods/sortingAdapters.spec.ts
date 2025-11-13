import type { SortingState } from 'uiSrc/components/base/layout/table'
import { DEFAULT_SORT, BrowserStorageItem } from 'uiSrc/constants'
import {
  sortingStateToPropertySort,
  propertySortToSortingState,
  getDefaultSorting,
} from './sortingAdapters'

const mockLocalStorageGet = jest.fn()

jest.mock('uiSrc/services', () => {
  const actual = jest.requireActual('uiSrc/services')
  return {
    ...actual,
    localStorageService: {
      ...actual.localStorageService,
      get: (...args: any[]) => mockLocalStorageGet(...(args as any)),
    },
  }
})

describe('sortingAdapters', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('propertySortToSortingState should convert EUI sort to table SortingState', () => {
    const sorting = propertySortToSortingState({
      field: 'name',
      direction: 'desc',
    })
    expect(sorting).toEqual([{ id: 'name', desc: true }])
  })

  it('propertySortToSortingState should fallback to DEFAULT_SORT when sort is undefined', () => {
    const sorting = propertySortToSortingState(undefined as any)
    expect(sorting).toEqual([
      { id: DEFAULT_SORT.field, desc: DEFAULT_SORT.direction === 'desc' },
    ])
  })

  it('sortingStateToPropertySort should convert table SortingState to EUI sort', () => {
    const state: SortingState = [{ id: 'url', desc: false }]
    const sort = sortingStateToPropertySort(state)
    expect(sort).toEqual({ field: 'url', direction: 'asc' })
  })

  it('sortingStateToPropertySort should return fallback when SortingState is empty', () => {
    const fallback = { field: 'version', direction: 'desc' as const }
    const sort = sortingStateToPropertySort([], fallback)
    expect(sort).toEqual(fallback)
  })

  it('getDefaultSorting should read sort from localStorage when present', () => {
    mockLocalStorageGet.mockReturnValue({ field: 'name', direction: 'desc' })

    const sorting = getDefaultSorting()

    expect(mockLocalStorageGet).toHaveBeenCalledWith(
      BrowserStorageItem.rdiInstancesSorting,
    )
    expect(sorting).toEqual([{ id: 'name', desc: true }])
  })

  it('getDefaultSorting should fallback to DEFAULT_SORT when storage is empty', () => {
    mockLocalStorageGet.mockReturnValue(undefined)

    const sorting = getDefaultSorting()

    expect(sorting).toEqual([
      { id: DEFAULT_SORT.field, desc: DEFAULT_SORT.direction === 'desc' },
    ])
  })
})
