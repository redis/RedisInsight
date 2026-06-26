import React from 'react'
import { cloneDeep } from 'lodash'
import {
  act,
  fireEvent,
  initialStateDefault,
  mockStore,
  render,
  screen,
  waitFor,
} from 'uiSrc/utils/test-utils'
import { apiService } from 'uiSrc/services'
import { setSelectedKeyRefreshDisabled } from 'uiSrc/slices/browser/keys'
import { ArrayDataElement } from 'uiSrc/slices/interfaces/array'
import {
  arrayElementFactory,
  arrayElementWithValueFactory,
} from 'uiSrc/mocks/factories/browser/array/arrayElement.factory'

import { ArrayDetailsTable } from './ArrayDetailsTable'

// Store whose selected key is set but whose array `data.keyName` is still
// empty — the Search-tab / pre-View-load condition the edit key must survive.
const storeWithSelectedKey = (name: string) => {
  const state = cloneDeep(initialStateDefault)
  state.browser.keys.selectedKey.data = { name } as any
  state.browser.array.data.keyName = ''
  return mockStore(state)
}

const renderComponent = (
  elements: ArrayDataElement[],
  loading: boolean = false,
  error?: string,
) =>
  render(
    <ArrayDetailsTable
      elements={elements}
      loading={loading}
      error={error}
      isActive
    />,
  )

describe('ArrayDetailsTable', () => {
  it('renders an index cell for each element', () => {
    // Pin the indexes the assertions look for — including the u64 boundary
    // case (2^64 - 6) — instead of relying on the factory sequence.
    renderComponent([
      arrayElementFactory.build({ index: '0' }),
      arrayElementFactory.build({ index: '7' }),
      arrayElementFactory.build({ index: '18446744073709551610' }),
    ])

    expect(screen.getByTestId('array-details-table-index-0')).toHaveTextContent(
      '0',
    )
    expect(screen.getByTestId('array-details-table-index-7')).toHaveTextContent(
      '7',
    )
    expect(
      screen.getByTestId('array-details-table-index-18446744073709551610'),
    ).toHaveTextContent('18446744073709551610')
  })

  it('shows "(empty)" for null values (gap-preserving range)', () => {
    renderComponent([arrayElementFactory.build({ index: '3' })])

    expect(screen.getByTestId('array-details-table-empty-3')).toHaveTextContent(
      '(empty)',
    )
  })

  it('shows "(empty)" when value is undefined (JSON-dropped key edge case)', () => {
    renderComponent([
      arrayElementFactory.build({
        index: '4',
        value: undefined,
      } as unknown as Partial<ArrayDataElement>),
    ])

    expect(screen.getByTestId('array-details-table-empty-4')).toHaveTextContent(
      '(empty)',
    )
  })

  it('renders a value cell for populated rows', () => {
    renderComponent([arrayElementWithValueFactory.build({ index: '1' })])

    expect(
      screen.getByTestId('array-details-table-value-1'),
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('array-details-table-empty-1'),
    ).not.toBeInTheDocument()
  })

  it('smoke-renders without crashing when there are no elements', () => {
    const { container } = renderComponent([])
    expect(container).toBeTruthy()
  })

  it('shows the error message in the empty state when the fetch failed', () => {
    renderComponent([], false, 'Network unreachable')
    expect(screen.getByText('Network unreachable')).toBeInTheDocument()
  })

  it('prefers the loading message over the error while a retry is in flight', () => {
    renderComponent([], true, 'Network unreachable')
    expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(screen.queryByText('Network unreachable')).not.toBeInTheDocument()
  })

  it('falls back to the default empty message when error is an empty string', () => {
    // The array slice resets `error` to `''` after a successful request, so
    // a nullish-only fallback would leave the table blank on an empty range.
    renderComponent([], false, '')
    expect(screen.getByText('No elements in range')).toBeInTheDocument()
  })

  describe('inline value edit (ARSET)', () => {
    it('reveals an edit affordance for a populated value and enters edit mode', () => {
      renderComponent([arrayElementWithValueFactory.build({ index: '1' })])

      act(() => {
        fireEvent.mouseEnter(
          screen.getByTestId('array-details-table_content-value-1'),
        )
      })
      fireEvent.click(screen.getByTestId('array-details-table_edit-btn-1'))

      expect(
        screen.getByTestId('array-details-table_value-editor-1'),
      ).toBeInTheDocument()
    })

    // A read that writes a patched view must block editing while in flight, so
    // its late response can't overwrite the optimistic patch — and this holds
    // across tabs (the View table must see a Search loading and vice-versa),
    // so it's driven from the slice, not the per-tab `loading` prop.
    it.each([
      ['range/scan', (s: any) => (s.browser.array.loading = true)],
      ['search', (s: any) => (s.browser.array.search.loading = true)],
    ])('disables editing while a %s read is in flight', (_name, setLoading) => {
      const state = cloneDeep(initialStateDefault)
      setLoading(state)
      const store = mockStore(state)

      render(
        <ArrayDetailsTable
          elements={[arrayElementWithValueFactory.build({ index: '1' })]}
          loading={false}
          isActive
        />,
        { store },
      )

      act(() => {
        fireEvent.mouseEnter(
          screen.getByTestId('array-details-table_content-value-1'),
        )
      })

      expect(
        screen.getByTestId('array-details-table_edit-btn-1'),
      ).toBeDisabled()
    })

    it('does not offer editing for an empty slot', () => {
      renderComponent([arrayElementFactory.build({ index: '3' })])

      expect(
        screen.queryByTestId('array-details-table_edit-btn-3'),
      ).not.toBeInTheDocument()
      expect(
        screen.getByTestId('array-details-table-empty-3'),
      ).toBeInTheDocument()
    })

    it('dispatches ARSET set-element when an edit is applied', async () => {
      const postSpy = jest
        .spyOn(apiService, 'post')
        .mockResolvedValue({ status: 200, data: '' })

      renderComponent([arrayElementWithValueFactory.build({ index: '1' })])

      act(() => {
        fireEvent.mouseEnter(
          screen.getByTestId('array-details-table_content-value-1'),
        )
      })
      fireEvent.click(screen.getByTestId('array-details-table_edit-btn-1'))

      fireEvent.change(
        screen.getByTestId('array-details-table_value-editor-1'),
        { target: { value: 'updated' } },
      )
      fireEvent.click(screen.getByTestId('apply-btn'))

      await waitFor(() => {
        const setCall = postSpy.mock.calls.find(([url]) =>
          (url as string).includes('array/set-element'),
        )
        expect(setCall).toBeTruthy()
        expect((setCall?.[1] as { index: string }).index).toBe('1')
      })

      postSpy.mockRestore()
    })

    it('uses the selected key name for ARSET even when the View range has not loaded', async () => {
      const postSpy = jest
        .spyOn(apiService, 'post')
        .mockResolvedValue({ status: 200, data: '' })
      const store = storeWithSelectedKey('mykey')

      render(
        <ArrayDetailsTable
          elements={[arrayElementWithValueFactory.build({ index: '1' })]}
          loading={false}
          isActive
        />,
        { store },
      )

      act(() => {
        fireEvent.mouseEnter(
          screen.getByTestId('array-details-table_content-value-1'),
        )
      })
      fireEvent.click(screen.getByTestId('array-details-table_edit-btn-1'))
      fireEvent.change(
        screen.getByTestId('array-details-table_value-editor-1'),
        { target: { value: 'updated' } },
      )
      fireEvent.click(screen.getByTestId('apply-btn'))

      await waitFor(() => {
        const setCall = postSpy.mock.calls.find(([url]) =>
          (url as string).includes('array/set-element'),
        )
        expect((setCall?.[1] as { keyName: string }).keyName).toBe('mykey')
      })

      postSpy.mockRestore()
    })

    it('re-enables the key-header refresh when unmounted mid-edit', () => {
      const store = mockStore(cloneDeep(initialStateDefault))

      const { unmount } = render(
        <ArrayDetailsTable
          elements={[arrayElementWithValueFactory.build({ index: '1' })]}
          loading={false}
          isActive
        />,
        { store },
      )

      act(() => {
        fireEvent.mouseEnter(
          screen.getByTestId('array-details-table_content-value-1'),
        )
      })
      fireEvent.click(screen.getByTestId('array-details-table_edit-btn-1'))
      expect(store.getActions()).toContainEqual(
        setSelectedKeyRefreshDisabled(true),
      )

      unmount()

      // The last refresh-disabled action must be `false` — without an unmount
      // cleanup it would remain `true` and the header refresh would stay
      // disabled after the panel/tab goes away with an editor still open.
      const refreshActions = store
        .getActions()
        .filter((a) => a.type === setSelectedKeyRefreshDisabled(false).type)
      expect(refreshActions.at(-1)).toEqual(
        setSelectedKeyRefreshDisabled(false),
      )
    })

    it('drops the editor and re-enables refresh when its tab is hidden', () => {
      const store = mockStore(cloneDeep(initialStateDefault))
      const element = arrayElementWithValueFactory.build({ index: '1' })

      const { rerender } = render(
        <ArrayDetailsTable elements={[element]} loading={false} isActive />,
        { store },
      )

      act(() => {
        fireEvent.mouseEnter(
          screen.getByTestId('array-details-table_content-value-1'),
        )
      })
      fireEvent.click(screen.getByTestId('array-details-table_edit-btn-1'))
      expect(
        screen.getByTestId('array-details-table_value-editor-1'),
      ).toBeInTheDocument()

      // Switch to another tab: this table is no longer the visible one.
      rerender(
        <ArrayDetailsTable
          elements={[element]}
          loading={false}
          isActive={false}
        />,
      )

      // Editor is abandoned and refresh released — a hidden tab must not keep
      // the header refresh disabled (tabs stay mounted via display:none).
      expect(
        screen.queryByTestId('array-details-table_value-editor-1'),
      ).not.toBeInTheDocument()
      const refreshActions = store
        .getActions()
        .filter((a) => a.type === setSelectedKeyRefreshDisabled(false).type)
      expect(refreshActions.at(-1)).toEqual(
        setSelectedKeyRefreshDisabled(false),
      )
    })

    it('keeps refresh disabled while editing, even with a hidden sibling table mounted', () => {
      const store = mockStore(cloneDeep(initialStateDefault))
      const element = arrayElementWithValueFactory.build({ index: '1' })

      // Both View (active) and Search (hidden) mount a table from the same key.
      render(
        <>
          <ArrayDetailsTable elements={[element]} loading={false} isActive />
          <ArrayDetailsTable
            elements={[element]}
            loading={false}
            isActive={false}
          />
        </>,
        { store },
      )

      // Open the editor in the active (first) table.
      act(() => {
        fireEvent.mouseEnter(
          screen.getAllByTestId('array-details-table_content-value-1')[0],
        )
      })
      fireEvent.click(
        screen.getAllByTestId('array-details-table_edit-btn-1')[0],
      )

      // The hidden sibling must not re-enable refresh during the edit.
      const refreshActions = store
        .getActions()
        .filter((a) => a.type === setSelectedKeyRefreshDisabled(false).type)
      expect(refreshActions.at(-1)).toEqual(setSelectedKeyRefreshDisabled(true))
    })
  })
})
