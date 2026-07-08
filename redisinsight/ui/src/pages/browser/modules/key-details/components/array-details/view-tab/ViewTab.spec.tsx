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
import { KeyTypes, KeyValueFormat } from 'uiSrc/constants'
import { stringToBuffer } from 'uiSrc/utils'
import { apiService } from 'uiSrc/services'
import { initialState as initialStateArray } from 'uiSrc/slices/browser/array'
import { ArrayDataElement } from 'uiSrc/slices/interfaces/array'
import {
  arrayElementFactory,
  arrayElementWithValueFactory,
} from 'uiSrc/mocks/factories/browser/array/arrayElement.factory'
import ViewTab from './ViewTab'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
}))

const KEY = 'readings'
const keyBuffer = stringToBuffer(KEY)
const keyA = stringToBuffer('key-a')
const keyB = stringToBuffer('key-b')

const ADD_BTN = 'add-key-value-items-btn'
const PANEL = 'array-add-form'

// isArrayKeyReady requires the selected key to be an Array whose name matches
// keyProp, so seed the store's selected key to the rendered one.
const buildState = (
  elements: ArrayDataElement[],
  selectedKey: ReturnType<typeof stringToBuffer> = keyBuffer,
) => {
  const next = cloneDeep(initialStateDefault)
  next.browser.array = cloneDeep(initialStateArray)
  next.browser.array.data = { ...next.browser.array.data, elements }
  next.browser.keys.selectedKey.loading = false
  next.browser.keys.selectedKey.data = {
    type: KeyTypes.Array,
    name: selectedKey,
  } as any
  // The delete thunks' stale-selection guard reads the app-context selection;
  // without it a completed delete reports not-applied and skips the UI updates.
  next.app.context.browser.keyList.selectedKey = keyBuffer
  return next
}

const renderView = (
  keyProp: ReturnType<typeof stringToBuffer>,
  props: Partial<React.ComponentProps<typeof ViewTab>> = {},
  elements: ArrayDataElement[] = [],
) => {
  const store = mockStore(buildState(elements, keyProp))
  store.clearActions()
  return render(<ViewTab keyProp={keyProp} isActive {...props} />, { store })
}

describe('ViewTab', () => {
  it('renders the value-format selector alongside Add Elements', () => {
    renderView(keyBuffer, {}, [
      arrayElementWithValueFactory.build({ index: '7' }),
    ])

    expect(screen.getByTestId('select-format-key-value')).toBeInTheDocument()
    expect(screen.getByTestId(ADD_BTN)).toBeInTheDocument()
  })

  it('expands a populated row into the full formatted value', async () => {
    const user = userEvent.setup()
    const state = buildState([
      arrayElementWithValueFactory.build({
        index: '7',
        value: stringToBuffer('# Heading'),
      }),
    ])
    state.browser.keys.selectedKey.viewFormat = KeyValueFormat.Markdown
    const store = mockStore(state)
    store.clearActions()
    render(<ViewTab keyProp={keyBuffer} isActive />, { store })

    // Collapsed rows already render the Markdown viewer inline; the expanded
    // sub-row surface is not mounted yet.
    expect(screen.getAllByTestId('markdown-viewer')).toHaveLength(1)
    expect(
      screen.queryByTestId('array-expanded-value-7'),
    ).not.toBeInTheDocument()

    await user.click(screen.getByTestId('array-details-table-index-7'))

    expect(
      await screen.findByTestId('array-expanded-value-7'),
    ).toBeInTheDocument()
    expect(screen.getAllByTestId('markdown-viewer')).toHaveLength(2)
  })

  it('does not expand an empty slot', async () => {
    const user = userEvent.setup()
    renderView(keyBuffer, {}, [arrayElementFactory.build({ index: '3' })])

    await user.click(screen.getByTestId('array-details-table-index-3'))

    expect(
      screen.queryByTestId('array-expanded-value-3'),
    ).not.toBeInTheDocument()
  })

  it('renders a per-row delete affordance for a populated element', () => {
    renderView(keyBuffer, {}, [
      arrayElementWithValueFactory.build({ index: '7' }),
    ])

    expect(screen.getByTestId('array-remove-btn-7-icon')).toBeInTheDocument()
  })

  it('deletes the element via ARDEL on confirm', async () => {
    apiService.delete = jest
      .fn()
      .mockResolvedValue({ status: 200, data: { affected: '1' } })
    apiService.post = jest
      .fn()
      .mockResolvedValue({ status: 200, data: { keyName: KEY, count: '3' } })

    renderView(keyBuffer, {}, [
      arrayElementWithValueFactory.build({ index: '7' }),
    ])

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

  it('bulk-deletes the selected elements via a single ARDEL', async () => {
    apiService.delete = jest
      .fn()
      .mockResolvedValue({ status: 200, data: { affected: '2' } })
    apiService.post = jest
      .fn()
      .mockResolvedValue({ status: 200, data: { keyName: KEY, count: '0' } })

    renderView(keyBuffer, {}, [
      arrayElementWithValueFactory.build({ index: '0' }),
      arrayElementWithValueFactory.build({ index: '5' }),
    ])

    // The header checkbox selects every loaded row.
    fireEvent.click(screen.getByRole('checkbox', { name: /all rows/i }))

    // The bulk-delete trigger appears in the actions-column header, and the
    // confirm popover states the count.
    fireEvent.click(await screen.findByTestId('array-bulk-remove-btn-icon'))
    expect(
      await screen.findByText(
        /2 selected element\(s\) will be permanently removed/,
      ),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('array-bulk-remove-btn'))

    await waitFor(() =>
      expect(apiService.delete).toHaveBeenCalledWith(
        expect.stringContaining('array/elements'),
        expect.objectContaining({
          data: { keyName: keyBuffer, indexes: ['0', '5'] },
        }),
      ),
    )
  })

  it('deletes the inclusive window via ARDELRANGE on confirm', async () => {
    apiService.delete = jest
      .fn()
      .mockResolvedValue({ status: 200, data: { affected: '2' } })
    apiService.post = jest
      .fn()
      .mockResolvedValue({ status: 200, data: { keyName: KEY, count: '3' } })

    renderView(keyBuffer, {}, [
      arrayElementWithValueFactory.build({ index: '7' }),
    ])

    fireEvent.click(screen.getByTestId('array-delete-range'))
    fireEvent.click(await screen.findByTestId('array-delete-range-confirm'))

    // The form's default range is the live input value the delete targets.
    await waitFor(() =>
      expect(apiService.delete).toHaveBeenCalledWith(
        expect.stringContaining('array/range'),
        expect.objectContaining({
          data: { keyName: keyBuffer, start: '0', end: '9' },
        }),
      ),
    )
  })

  it('drops the multi-select when a range delete is confirmed', async () => {
    apiService.delete = jest
      .fn()
      .mockResolvedValue({ status: 200, data: { affected: '2' } })
    apiService.post = jest
      .fn()
      .mockResolvedValue({ status: 200, data: { keyName: KEY, count: '3' } })

    renderView(keyBuffer, {}, [
      arrayElementWithValueFactory.build({ index: '0' }),
      arrayElementWithValueFactory.build({ index: '5' }),
    ])

    fireEvent.click(screen.getByRole('checkbox', { name: /all rows/i }))
    expect(
      await screen.findByTestId('array-bulk-remove-btn-icon'),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('array-delete-range'))
    fireEvent.click(await screen.findByTestId('array-delete-range-confirm'))

    await waitFor(() =>
      expect(
        screen.queryByTestId('array-bulk-remove-btn-icon'),
      ).not.toBeInTheDocument(),
    )
  })

  it('keeps the delete-range confirm open across a non-key re-render', async () => {
    // The confirm lives in DeleteRangeAction local state, so it survives only
    // while the Actions render prop keeps a stable identity. A fresh Actions
    // each render would be a new component type, remounting DeleteRangeAction
    // and silently dropping an open confirm on any parent update.
    const { rerender } = renderView(keyBuffer, {}, [
      arrayElementWithValueFactory.build({ index: '7' }),
    ])

    fireEvent.click(screen.getByTestId('array-delete-range'))
    expect(
      await screen.findByTestId('array-delete-range-confirm'),
    ).toBeInTheDocument()

    // Re-render that is not a key switch (same bytes, fresh buffer): the open
    // confirm must not be torn down.
    rerender(<ViewTab keyProp={stringToBuffer(KEY)} isActive />)

    expect(screen.getByTestId('array-delete-range-confirm')).toBeInTheDocument()
  })

  it('drops the multi-select when the range is reset', async () => {
    // resetQuery refires the default range with resetData:false, so the current
    // rows stay rendered; the selection must still clear on reset.
    apiService.post = jest
      .fn()
      .mockResolvedValue({ status: 200, data: { keyName: KEY, elements: [] } })

    renderView(keyBuffer, {}, [
      arrayElementWithValueFactory.build({ index: '0' }),
      arrayElementWithValueFactory.build({ index: '5' }),
    ])

    fireEvent.click(screen.getByRole('checkbox', { name: /all rows/i }))
    expect(
      await screen.findByTestId('array-bulk-remove-btn-icon'),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('array-range-form-reset'))

    expect(
      screen.queryByTestId('array-bulk-remove-btn-icon'),
    ).not.toBeInTheDocument()
  })

  it('opens the add panel and fires open telemetry', () => {
    const onOpenAddItemPanel = jest.fn()
    renderView(keyA, { onOpenAddItemPanel })

    expect(screen.queryByTestId(PANEL)).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId(ADD_BTN))

    expect(onOpenAddItemPanel).toHaveBeenCalled()
    expect(screen.getByTestId(PANEL)).toBeInTheDocument()
  })

  it('fires cancel telemetry and hides the panel on Cancel', () => {
    const onCloseAddItemPanel = jest.fn()
    renderView(keyA, { onCloseAddItemPanel })

    fireEvent.click(screen.getByTestId(ADD_BTN))
    fireEvent.click(screen.getByTestId(`${PANEL}-cancel`))

    expect(onCloseAddItemPanel).toHaveBeenCalled()
    expect(screen.queryByTestId(PANEL)).not.toBeInTheDocument()
  })

  it('closes the panel when the selected key changes', () => {
    const { rerender } = renderView(keyA)

    fireEvent.click(screen.getByTestId(ADD_BTN))
    expect(screen.getByTestId(PANEL)).toBeInTheDocument()

    rerender(<ViewTab keyProp={keyB} isActive />)
    expect(screen.queryByTestId(PANEL)).not.toBeInTheDocument()
  })

  it('keeps the panel open when keyProp is a new buffer with the same bytes', () => {
    const { rerender } = renderView(keyA)

    fireEvent.click(screen.getByTestId(ADD_BTN))
    expect(screen.getByTestId(PANEL)).toBeInTheDocument()

    // Same key, fresh buffer object — a byte-exact compare must not close it.
    rerender(<ViewTab keyProp={stringToBuffer('key-a')} isActive />)
    expect(screen.getByTestId(PANEL)).toBeInTheDocument()
  })
})
