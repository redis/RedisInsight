import React from 'react'
import { cloneDeep } from 'lodash'
import userEvent from '@testing-library/user-event'
import {
  fireEvent,
  initialStateDefault,
  mockStore,
  render,
  screen,
  waitFor,
} from 'uiSrc/utils/test-utils'
import { KeyTypes } from 'uiSrc/constants'
import { stringToBuffer } from 'uiSrc/utils'
import { apiService } from 'uiSrc/services'
import { initialState as initialStateArray } from 'uiSrc/slices/browser/array'
import { ArraySearchState } from 'uiSrc/slices/interfaces/array'
import {
  arrayElementFactory,
  arrayElementWithValueFactory,
} from 'uiSrc/mocks/factories/browser/array/arrayElement.factory'
import SearchTab from './SearchTab'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
}))

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

  it('renders the value-format selector', () => {
    renderTab()

    expect(screen.getByTestId('select-format-key-value')).toBeInTheDocument()
  })

  it('disables the search form while the key is locked for editing', () => {
    // isRefreshDisabled is set by the active table while a value editor is open
    // or an ARSET is in flight; the query form must not reload the table then.
    const state = buildState()
    state.browser.keys.selectedKey.isRefreshDisabled = true
    const store = mockStore(state)

    render(<SearchTab keyProp={keyBuffer} isActive />, { store })

    expect(screen.getByTestId('array-search-form-run')).toBeDisabled()
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

  it('expands a match to show its neighbour band once context is enabled', async () => {
    const user = userEvent.setup()
    apiService.post = jest.fn().mockResolvedValue({
      status: 200,
      data: {
        keyName: KEY,
        elements: [
          'v2',
          'v3',
          'v4',
          'v5',
          'v6',
          'v7',
          'v8',
          'v9',
          'v10',
          'v11',
          'v12',
        ],
      },
    })
    renderTab({
      loaded: true,
      loading: false,
      error: '',
      data: [arrayElementWithValueFactory.build({ index: '7' })],
    })

    // Context is off by default — enable it so the row can expand. fireEvent
    // sidesteps the redis-ui control's `pointer-events: none` wrapper.
    fireEvent.click(screen.getByTestId('array-context-control-toggle'))

    await user.click(screen.getByTestId('array-details-table-index-7'))

    expect(
      await screen.findByTestId('array-context-band-7'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('array-context-band-match-7')).toBeInTheDocument()
  })

  it('does not expand a match while context is off (default)', async () => {
    const user = userEvent.setup()
    const post = jest.fn()
    apiService.post = post
    renderTab({
      loaded: true,
      loading: false,
      error: '',
      data: [arrayElementWithValueFactory.build({ index: '7' })],
    })

    // Default state: context disabled → clicking the row must not expand it.
    await user.click(screen.getByTestId('array-details-table-index-7'))

    expect(screen.queryByTestId('array-context-band-7')).not.toBeInTheDocument()
    expect(post).not.toHaveBeenCalled()
  })

  it('shows no disclosure chevron on match rows while context is off', () => {
    renderTab({
      loaded: true,
      loading: false,
      error: '',
      data: [arrayElementWithValueFactory.build({ index: '7' })],
    })

    expect(
      screen.queryByTestId('array-details-table-index-7-expander'),
    ).not.toBeInTheDocument()
  })

  it('shows a collapsed chevron on match rows once context is on', () => {
    renderTab({
      loaded: true,
      loading: false,
      error: '',
      data: [arrayElementWithValueFactory.build({ index: '7' })],
    })

    fireEvent.click(screen.getByTestId('array-context-control-toggle'))

    expect(
      screen.getByTestId('array-details-table-index-7-expander'),
    ).toHaveAttribute('aria-label', 'Chevron Right')
  })

  it('flips the chevron to expanded when a match row is opened', async () => {
    const user = userEvent.setup()
    apiService.post = jest.fn().mockResolvedValue({
      status: 200,
      data: { keyName: KEY, elements: ['v6', 'v7', 'v8'] },
    })
    renderTab({
      loaded: true,
      loading: false,
      error: '',
      data: [arrayElementWithValueFactory.build({ index: '7' })],
    })

    fireEvent.click(screen.getByTestId('array-context-control-toggle'))
    await user.click(screen.getByTestId('array-details-table-index-7'))

    await waitFor(() =>
      expect(
        screen.getByTestId('array-details-table-index-7-expander'),
      ).toHaveAttribute('aria-label', 'Chevron Down'),
    )
  })

  it('resets context to its default when the form is reset', () => {
    renderTab({
      loaded: true,
      loading: false,
      error: '',
      data: [arrayElementWithValueFactory.build({ index: '7' })],
    })

    // Enabling Context enables its count input; reset must turn it back off
    // (context state lives in SearchTab, not the query hook's resetQuery).
    fireEvent.click(screen.getByTestId('array-context-control-toggle'))
    expect(screen.getByTestId('array-context-control-count')).toBeEnabled()

    fireEvent.click(screen.getByTestId('array-search-form-reset'))

    expect(screen.getByTestId('array-context-control-count')).toBeDisabled()
  })

  it('drops the multi-select when the search is reset', async () => {
    renderTab({
      loaded: true,
      loading: false,
      error: '',
      data: [
        arrayElementWithValueFactory.build({ index: '7' }),
        arrayElementWithValueFactory.build({ index: '8' }),
      ],
    })

    // Select every match — the bulk trash appears in the header — then reset.
    fireEvent.click(screen.getByRole('checkbox', { name: /all rows/i }))
    expect(
      await screen.findByTestId('array-bulk-remove-btn-icon'),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('array-search-form-reset'))

    expect(
      screen.queryByTestId('array-bulk-remove-btn-icon'),
    ).not.toBeInTheDocument()
  })

  it('collapses the neighbour band when Context is toggled off', async () => {
    const user = userEvent.setup()
    apiService.post = jest.fn().mockResolvedValue({
      status: 200,
      data: { keyName: KEY, elements: ['v6', 'v7', 'v8'] },
    })
    renderTab({
      loaded: true,
      loading: false,
      error: '',
      data: [arrayElementWithValueFactory.build({ index: '7' })],
    })

    fireEvent.click(screen.getByTestId('array-context-control-toggle'))
    await user.click(screen.getByTestId('array-details-table-index-7'))
    expect(
      await screen.findByTestId('array-context-band-7'),
    ).toBeInTheDocument()

    // Toggling Context off must unmount the band (and stop its fetch), not
    // leave an already-expanded match still showing it.
    fireEvent.click(screen.getByTestId('array-context-control-toggle'))

    await waitFor(() =>
      expect(
        screen.queryByTestId('array-context-band-7'),
      ).not.toBeInTheDocument(),
    )
  })

  it('resets Context to off when the selected key changes', () => {
    // Context lives in the subheader (gated on isArrayKeyReady), so move the
    // prop and the store's selected key together to keep it visible to assert.
    const state = buildState({
      loaded: true,
      loading: false,
      error: '',
      data: [arrayElementWithValueFactory.build({ index: '7' })],
    })
    const store = mockStore(state)
    store.clearActions()
    const { rerender } = render(<SearchTab keyProp={keyBuffer} isActive />, {
      store,
    })

    fireEvent.click(screen.getByTestId('array-context-control-toggle'))
    expect(screen.getByRole('checkbox', { name: 'Context' })).toBeChecked()

    // The tab stays mounted across key switches; selecting another key resets
    // Context to its default rather than inheriting the previous key's.
    const otherKey = stringToBuffer('other-key')
    state.browser.keys.selectedKey.data!.name = otherKey
    rerender(<SearchTab keyProp={otherKey} isActive />)

    expect(screen.getByRole('checkbox', { name: 'Context' })).not.toBeChecked()
  })

  it('deletes a matched element via ARDEL on confirm', async () => {
    apiService.delete = jest
      .fn()
      .mockResolvedValue({ status: 200, data: { affected: '1' } })
    apiService.post = jest
      .fn()
      .mockResolvedValue({ status: 200, data: { keyName: KEY, count: '3' } })

    renderTab({
      loaded: true,
      loading: false,
      error: '',
      data: [arrayElementWithValueFactory.build({ index: '7' })],
    })

    fireEvent.click(screen.getByTestId('array-remove-btn-7-icon'))
    fireEvent.click(await screen.findByTestId('array-remove-btn-7'))

    await waitFor(() =>
      expect(apiService.delete).toHaveBeenCalledWith(
        expect.stringContaining('array/elements'),
        expect.objectContaining({
          data: { keyName: keyBuffer, indexes: ['7'] },
        }),
      ),
    )
  })

  it('keeps per-element delete on an index-only match (WITHVALUES off, null value)', () => {
    renderTab({
      loaded: true,
      loading: false,
      error: '',
      // A WITHVALUES-off match comes back with a null value but is a real,
      // deletable element — the delete affordance must still show.
      data: [arrayElementFactory.build({ index: '7' })],
    })

    expect(screen.getByTestId('array-remove-btn-7-icon')).toBeInTheDocument()
  })
})
