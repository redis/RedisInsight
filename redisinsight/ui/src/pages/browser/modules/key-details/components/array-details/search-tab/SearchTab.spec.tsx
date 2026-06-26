import React from 'react'
import { cloneDeep } from 'lodash'
import {
  initialStateDefault,
  mockStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { KeyTypes } from 'uiSrc/constants'
import { stringToBuffer } from 'uiSrc/utils'
import { initialState as initialStateArray } from 'uiSrc/slices/browser/array'
import { ArraySearchState } from 'uiSrc/slices/interfaces/array'
import { arrayElementWithValueFactory } from 'uiSrc/mocks/factories/browser/array/arrayElement.factory'
import SearchTab from './SearchTab'

const KEY = 'readings'
const keyBuffer = stringToBuffer(KEY)

const buildState = (
  search: Partial<ArraySearchState> = {},
  keyLoading = false,
) => {
  const next = cloneDeep(initialStateDefault)
  next.browser.array = cloneDeep(initialStateArray)
  next.browser.array.search = { ...next.browser.array.search, ...search }
  next.browser.keys.selectedKey.loading = keyLoading
  next.browser.keys.selectedKey.data = {
    type: KeyTypes.Array,
    name: keyBuffer,
  } as any
  return next
}

const renderTab = (search?: Partial<ArraySearchState>, keyLoading = false) => {
  const store = mockStore(buildState(search, keyLoading))
  store.clearActions()
  return render(<SearchTab keyProp={keyBuffer} isActive />, { store })
}

describe('SearchTab', () => {
  it('renders the search form', () => {
    renderTab()

    expect(screen.getByTestId('array-search-form')).toBeInTheDocument()
  })

  it('does not render the results table before a search has run', () => {
    renderTab({ loaded: false, loading: false, data: [] })

    expect(screen.queryByTestId('array-details-table')).not.toBeInTheDocument()
  })

  it('hides the results table while the selected key is loading (no stale flash on key switch)', () => {
    // Mirrors ViewTab: gate the table on the selected key not loading so a
    // key switch can't paint the previous key's matches for a frame before
    // the hook's reset effect runs.
    renderTab(
      {
        loaded: true,
        loading: false,
        error: '',
        data: [arrayElementWithValueFactory.build({ index: '7' })],
      },
      true,
    )

    expect(screen.queryByTestId('array-details-table')).not.toBeInTheDocument()
  })

  it('renders the matched index + value after a successful search', () => {
    renderTab({
      loaded: true,
      loading: false,
      error: '',
      data: [arrayElementWithValueFactory.build({ index: '7' })],
    })

    expect(screen.getByTestId('array-details-table')).toBeInTheDocument()
    expect(
      screen.getByTestId('array-details-table-index-7'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('array-details-table-value-7'),
    ).toBeInTheDocument()
  })

  it('shows a distinct error state when the search fails', () => {
    renderTab({
      loaded: true,
      loading: false,
      error: 'Search failed',
      data: [],
    })

    expect(screen.getByText('Search failed')).toBeInTheDocument()
    // The error must read differently from the no-matches empty state.
    expect(screen.queryByText('No elements in range')).not.toBeInTheDocument()
  })

  it('shows the empty state — distinct from an error — when a search finds no matches', () => {
    renderTab({ loaded: true, loading: false, error: '', data: [] })

    expect(screen.getByText('No elements in range')).toBeInTheDocument()
  })
})
