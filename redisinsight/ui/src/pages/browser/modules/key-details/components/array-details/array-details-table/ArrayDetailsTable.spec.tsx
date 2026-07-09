import React from 'react'
import { cloneDeep } from 'lodash'
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import userEvent from '@testing-library/user-event'
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
import keysReducer, {
  refreshKeyInfoSuccess,
  setSelectedKeyRefreshDisabled,
  setViewFormat,
} from 'uiSrc/slices/browser/keys'
import { KeyValueFormat } from 'uiSrc/constants'
import { stringToBuffer } from 'uiSrc/utils'
import { ArrayDataElement } from 'uiSrc/slices/interfaces/array'
import {
  arrayElementFactory,
  arrayElementWithValueFactory,
} from 'uiSrc/mocks/factories/browser/array/arrayElement.factory'

import { ArrayDetailsTable } from './ArrayDetailsTable'

jest.mock('uiSrc/components/base/code-editor', () => {
  const ReactMock = require('react')
  return {
    __esModule: true,
    CodeEditor: (props: any) =>
      ReactMock.createElement('textarea', {
        'data-testid': 'array-value-code-editor',
        value: props.value,
        onChange: (e: any) => props.onChange?.(e.target.value),
      }),
  }
})

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

  it('shows "Empty" for null values (gap-preserving range)', () => {
    renderComponent([arrayElementFactory.build({ index: '3' })])

    expect(screen.getByTestId('array-details-table-empty-3')).toHaveTextContent(
      'Empty',
    )
  })

  it('shows "Empty" when value is undefined (JSON-dropped key edge case)', () => {
    renderComponent([
      arrayElementFactory.build({
        index: '4',
        value: undefined,
      } as unknown as Partial<ArrayDataElement>),
    ])

    expect(screen.getByTestId('array-details-table-empty-4')).toHaveTextContent(
      'Empty',
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
      fireEvent.click(screen.getByTestId('array-edit-btn-1'))

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

      expect(screen.getByTestId('array-edit-btn-1')).toBeDisabled()
    })

    it('does not offer editing for an empty slot', () => {
      renderComponent([arrayElementFactory.build({ index: '3' })])

      expect(screen.queryByTestId('array-edit-btn-3')).not.toBeInTheDocument()
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
      fireEvent.click(screen.getByTestId('array-edit-btn-1'))

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
      fireEvent.click(screen.getByTestId('array-edit-btn-1'))
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

    it('keeps the open editor when a same-key info refresh swaps the name buffer', () => {
      // A successful ARSET dispatches `refreshKeyInfoAction`, and
      // `refreshKeyInfoSuccess` replaces `selectedKey.data` with a *new* name
      // buffer instance for the unchanged key. A store that runs the real
      // `keys` reducer is needed to reproduce the swap (`mockStore` doesn't run
      // reducers); the other branches the table reads are held constant.
      const keys = cloneDeep(initialStateDefault.browser.keys)
      keys.selectedKey.data = { name: stringToBuffer('mykey') } as any
      const store = configureStore({
        reducer: combineReducers({
          browser: combineReducers({
            keys: keysReducer,
            array: (s = initialStateDefault.browser.array) => s,
          }),
          connections: combineReducers({
            instances: (s = initialStateDefault.connections.instances) => s,
          }),
        }),
        preloadedState: { browser: { keys } },
        middleware: (getDefault) =>
          getDefault({ serializableCheck: false, immutableCheck: false }),
      })

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
      fireEvent.click(screen.getByTestId('array-edit-btn-1'))
      expect(
        screen.getByTestId('array-details-table_value-editor-1'),
      ).toBeInTheDocument()

      // Same key, fresh buffer instance — the editor must survive the refresh.
      act(() => {
        store.dispatch(refreshKeyInfoSuccess({ name: stringToBuffer('mykey') }))
      })

      expect(
        screen.getByTestId('array-details-table_value-editor-1'),
      ).toBeInTheDocument()
    })

    it('a stale save does not close an editor reopened as a new session', async () => {
      // Guard passes (same key + instance) so the thunk would call onSuccess;
      // the edit-session token is what must stop it closing the new editor.
      const key = stringToBuffer('mykey')
      const state = cloneDeep(initialStateDefault)
      state.browser.keys.selectedKey.data = { name: key } as any
      state.app.context.browser.keyList.selectedKey = key
      state.connections.instances.connectedInstance = { id: 'db-1' } as any
      const store = mockStore(state)

      let resolvePost: () => void = () => {}
      const postSpy = jest.spyOn(apiService, 'post').mockImplementation(
        () =>
          new Promise((r) => {
            resolvePost = () => r({ status: 200, data: '' } as any)
          }),
      )
      const element = arrayElementWithValueFactory.build({ index: '1' })
      const props = { elements: [element], loading: false }

      const { rerender } = render(<ArrayDetailsTable {...props} isActive />, {
        store,
      })

      // Session 1: open and apply — the ARSET stays in flight.
      act(() => {
        fireEvent.mouseEnter(
          screen.getByTestId('array-details-table_content-value-1'),
        )
      })
      fireEvent.click(screen.getByTestId('array-edit-btn-1'))
      fireEvent.change(
        screen.getByTestId('array-details-table_value-editor-1'),
        { target: { value: 'first' } },
      )
      fireEvent.click(screen.getByTestId('apply-btn'))

      // Switch away (closes the editor) and back, then reopen — session 2.
      rerender(<ArrayDetailsTable {...props} isActive={false} />)
      rerender(<ArrayDetailsTable {...props} isActive />)
      act(() => {
        fireEvent.mouseEnter(
          screen.getByTestId('array-details-table_content-value-1'),
        )
      })
      fireEvent.click(screen.getByTestId('array-edit-btn-1'))
      expect(
        screen.getByTestId('array-details-table_value-editor-1'),
      ).toBeInTheDocument()

      // The first (stale) save resolves — it must not close the new editor.
      await act(async () => {
        resolvePost()
      })

      expect(
        screen.getByTestId('array-details-table_value-editor-1'),
      ).toBeInTheDocument()

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
      fireEvent.click(screen.getByTestId('array-edit-btn-1'))
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
      fireEvent.click(screen.getByTestId('array-edit-btn-1'))
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
      fireEvent.click(screen.getAllByTestId('array-edit-btn-1')[0])

      // The hidden sibling must not re-enable refresh during the edit.
      const refreshActions = store
        .getActions()
        .filter((a) => a.type === setSelectedKeyRefreshDisabled(false).type)
      expect(refreshActions.at(-1)).toEqual(setSelectedKeyRefreshDisabled(true))
    })
  })

  describe('Monaco drawer (expand)', () => {
    const withValue = (index: string, text: string) => {
      const element = arrayElementWithValueFactory.build({ index })
      element.value = stringToBuffer(text) as typeof element.value
      return element
    }

    it('opens the drawer seeded with the value on expand', () => {
      render(
        <ArrayDetailsTable
          elements={[withValue('1', 'hello')]}
          loading={false}
          isActive
        />,
      )

      fireEvent.click(screen.getByTestId('array-expand-btn-1'))

      expect(screen.getByTestId('array-value-code-editor')).toHaveValue('hello')
    })

    it('pauses the key-header refresh while the drawer is open', () => {
      const store = mockStore(cloneDeep(initialStateDefault))
      render(
        <ArrayDetailsTable
          elements={[withValue('1', 'hello')]}
          loading={false}
          isActive
        />,
        { store },
      )

      fireEvent.click(screen.getByTestId('array-expand-btn-1'))

      expect(store.getActions()).toContainEqual(
        setSelectedKeyRefreshDisabled(true),
      )
    })

    it('abandons the open drawer when the tab is hidden', () => {
      const element = withValue('1', 'hello')
      const { rerender } = render(
        <ArrayDetailsTable elements={[element]} loading={false} isActive />,
      )

      fireEvent.click(screen.getByTestId('array-expand-btn-1'))
      expect(screen.getByTestId('array-value-code-editor')).toBeInTheDocument()

      rerender(
        <ArrayDetailsTable
          elements={[element]}
          loading={false}
          isActive={false}
        />,
      )

      expect(
        screen.queryByTestId('array-value-code-editor'),
      ).not.toBeInTheDocument()
    })

    it('closes an inline edit on another row when the drawer opens', () => {
      render(
        <ArrayDetailsTable
          elements={[withValue('0', 'aaa'), withValue('1', 'bbb')]}
          loading={false}
          isActive
        />,
      )

      // Open inline edit on row 0.
      fireEvent.click(screen.getByTestId('array-edit-btn-0'))
      expect(
        screen.getByTestId('array-details-table_value-editor-0'),
      ).toBeInTheDocument()

      // Open the drawer on row 1 — the inline editor on row 0 must close, so a
      // later drawer save can't clear it and drop its unsaved text.
      fireEvent.click(screen.getByTestId('array-expand-btn-1'))

      expect(
        screen.queryByTestId('array-details-table_value-editor-0'),
      ).not.toBeInTheDocument()
      expect(screen.getByTestId('array-value-code-editor')).toBeInTheDocument()
    })

    it('hides all row edit/expand triggers while the drawer is open', () => {
      render(
        <ArrayDetailsTable
          elements={[withValue('0', 'aaa'), withValue('1', 'bbb')]}
          loading={false}
          isActive
        />,
      )

      fireEvent.click(screen.getByTestId('array-expand-btn-1'))
      expect(screen.getByTestId('array-value-code-editor')).toBeInTheDocument()

      // No second editor can be opened while the drawer is up — a re-open would
      // otherwise re-seed the drawer and drop unsaved text.
      expect(screen.queryByTestId('array-edit-btn-0')).not.toBeInTheDocument()
      expect(screen.queryByTestId('array-expand-btn-0')).not.toBeInTheDocument()
      expect(screen.queryByTestId('array-expand-btn-1')).not.toBeInTheDocument()
    })

    it('closes the drawer when the value formatter changes', () => {
      // The seed was serialized under the previous format; re-serializing it
      // under a new one on Save would write different bytes.
      const keys = cloneDeep(initialStateDefault.browser.keys)
      keys.selectedKey.data = { name: stringToBuffer('mykey') } as any
      keys.selectedKey.viewFormat = KeyValueFormat.Unicode
      const store = configureStore({
        reducer: combineReducers({
          browser: combineReducers({
            keys: keysReducer,
            array: (s = initialStateDefault.browser.array) => s,
          }),
          connections: combineReducers({
            instances: (s = initialStateDefault.connections.instances) => s,
          }),
        }),
        preloadedState: { browser: { keys } },
        middleware: (getDefault) =>
          getDefault({ serializableCheck: false, immutableCheck: false }),
      })

      render(
        <ArrayDetailsTable
          elements={[withValue('1', 'hello')]}
          loading={false}
          isActive
        />,
        { store },
      )

      fireEvent.click(screen.getByTestId('array-expand-btn-1'))
      expect(screen.getByTestId('array-value-code-editor')).toBeInTheDocument()

      act(() => {
        store.dispatch(setViewFormat(KeyValueFormat.HEX))
      })

      expect(
        screen.queryByTestId('array-value-code-editor'),
      ).not.toBeInTheDocument()
    })

    it('closes the drawer only after the save succeeds (not optimistically)', async () => {
      const postSpy = jest
        .spyOn(apiService, 'post')
        .mockResolvedValue({ status: 200, data: '' })
      const state = cloneDeep(initialStateDefault)
      state.browser.keys.selectedKey.data = {
        name: stringToBuffer('mykey'),
      } as any
      // Live selection + instance must match for the thunk's success callback
      // (which closes the drawer) to fire.
      state.app.context.browser.keyList.selectedKey = stringToBuffer(
        'mykey',
      ) as any
      state.connections.instances.connectedInstance = { id: 'db-1' } as any
      const store = mockStore(state)

      render(
        <ArrayDetailsTable
          elements={[withValue('1', 'hello')]}
          loading={false}
          isActive
        />,
        { store },
      )

      fireEvent.click(screen.getByTestId('array-expand-btn-1'))
      fireEvent.change(screen.getByTestId('array-value-code-editor'), {
        target: { value: 'updated' },
      })
      fireEvent.click(screen.getByTestId('array-value-editor-save-btn'))

      // Still open synchronously after Save — closes only when the ARSET
      // success callback runs.
      expect(screen.getByTestId('array-value-code-editor')).toBeInTheDocument()
      await waitFor(() => {
        expect(
          screen.queryByTestId('array-value-code-editor'),
        ).not.toBeInTheDocument()
      })

      postSpy.mockRestore()
    })

    it('dispatches ARSET when the drawer value is saved', async () => {
      const postSpy = jest
        .spyOn(apiService, 'post')
        .mockResolvedValue({ status: 200, data: '' })
      const store = storeWithSelectedKey('mykey')

      render(
        <ArrayDetailsTable
          elements={[withValue('1', 'hello')]}
          loading={false}
          isActive
        />,
        { store },
      )

      fireEvent.click(screen.getByTestId('array-expand-btn-1'))
      fireEvent.change(screen.getByTestId('array-value-code-editor'), {
        target: { value: 'updated' },
      })
      fireEvent.click(screen.getByTestId('array-value-editor-save-btn'))

      await waitFor(() => {
        const setCall = postSpy.mock.calls.find(([url]) =>
          (url as string).includes('array/set-element'),
        )
        expect(setCall).toBeTruthy()
        expect((setCall?.[1] as { index: string }).index).toBe('1')
      })

      postSpy.mockRestore()
    })
  })

  it('renders an expanded panel when a row is expanded via row click', async () => {
    const user = userEvent.setup()
    render(
      <ArrayDetailsTable
        elements={[arrayElementWithValueFactory.build({ index: '7' })]}
        loading={false}
        isActive
        expandRowOnClick
        getIsRowExpandable={() => true}
        renderExpandedRow={(row) => (
          <div data-testid={`expanded-${row.original.index}`}>panel</div>
        )}
      />,
    )

    await user.click(screen.getByTestId('array-details-table-index-7'))

    expect(await screen.findByTestId('expanded-7')).toBeInTheDocument()
  })

  it('renders no expand affordance when expansion props are omitted', () => {
    render(
      <ArrayDetailsTable
        elements={[arrayElementWithValueFactory.build({ index: '7' })]}
        loading={false}
        isActive
      />,
    )
    expect(screen.queryByTestId('expanded-7')).not.toBeInTheDocument()
  })

  const deleteConfig = {
    deleting: '',
    suffix: '-array-element',
    hideEmptySlots: true,
    closePopover: jest.fn(),
    showPopover: jest.fn(),
    handleDeleteElement: jest.fn(),
  }

  it('renders a per-row delete trigger when deleteConfig is provided', () => {
    render(
      <ArrayDetailsTable
        elements={[arrayElementWithValueFactory.build({ index: '2' })]}
        loading={false}
        isActive
        deleteConfig={deleteConfig}
      />,
    )

    expect(screen.getByTestId('array-remove-btn-2-icon')).toBeInTheDocument()
  })

  it('renders no actions column when deleteConfig is omitted', () => {
    render(
      <ArrayDetailsTable
        elements={[arrayElementWithValueFactory.build({ index: '2' })]}
        loading={false}
        isActive
      />,
    )

    expect(
      screen.queryByTestId('array-remove-btn-2-icon'),
    ).not.toBeInTheDocument()
  })

  const selectionConfig = {
    rowSelection: {},
    onRowSelectionChange: jest.fn(),
    getRowCanSelect: (element: ArrayDataElement) => element.value != null,
  }

  it('shows the header select-all when at least one row is selectable', () => {
    render(
      <ArrayDetailsTable
        elements={[
          arrayElementWithValueFactory.build({ index: '0' }),
          arrayElementFactory.build({ index: '1' }),
        ]}
        loading={false}
        isActive
        selectionConfig={selectionConfig}
      />,
    )

    expect(
      screen.getByRole('checkbox', { name: /all rows/i }),
    ).toBeInTheDocument()
  })

  it('hides the header select-all when no row is selectable (all-empty range)', () => {
    render(
      <ArrayDetailsTable
        elements={[
          arrayElementFactory.build({ index: '6' }),
          arrayElementFactory.build({ index: '7' }),
        ]}
        loading={false}
        isActive
        selectionConfig={selectionConfig}
      />,
    )

    expect(
      screen.queryByRole('checkbox', { name: /all rows/i }),
    ).not.toBeInTheDocument()
  })
})
