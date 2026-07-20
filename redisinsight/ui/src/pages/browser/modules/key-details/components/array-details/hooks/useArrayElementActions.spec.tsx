import { cloneDeep } from 'lodash'
import {
  act,
  initialStateDefault,
  mockStore,
  renderHook,
} from 'uiSrc/utils/test-utils'
import { apiService } from 'uiSrc/services'
import { stringToBuffer } from 'uiSrc/utils'
import {
  arrayElementFactory,
  arrayElementWithValueFactory,
} from 'uiSrc/mocks/factories/browser/array/arrayElement.factory'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { ArrayDataElement } from 'uiSrc/slices/interfaces/array'
import { useArrayElementActions } from './useArrayElementActions'

// Shrink the bulk-delete cap so the over-cap guard is testable without
// building a million-element selection.
jest.mock('../constants', () => ({
  ...jest.requireActual('../constants'),
  ARRAY_BULK_DELETE_MAX: 5,
}))

const KEY = 'readings'
const keyBuffer = stringToBuffer(KEY)

// The delete guard reads the app-context selection; point it at the key under
// test so a bulk delete isn't skipped as a stale-key completion.
const buildStore = () => {
  const state = cloneDeep(initialStateDefault)
  state.app.context.browser.keyList.selectedKey = keyBuffer
  const store = mockStore(state)
  store.clearActions()
  return store
}

const renderActions = (
  elements: ArrayDataElement[],
  hideEmptySlots = false,
) => {
  const store = buildStore()
  // Hold the rendered set in a mutable box the hook reads, so a rerender can
  // swap in a new result set (a range change / new search) mid-selection.
  const box = { els: elements }
  const utils = renderHook(
    () =>
      useArrayElementActions(keyBuffer, { elements: box.els, hideEmptySlots }),
    { store },
  )
  const setElements = (els: ArrayDataElement[]) => {
    box.els = els
    utils.rerender()
  }
  return { ...utils, setElements, store }
}

const selectAll = (
  result: { current: ReturnType<typeof useArrayElementActions> },
  indexes: string[],
) =>
  act(() => {
    result.current.selectionConfig.onRowSelectionChange(
      Object.fromEntries(indexes.map((index) => [index, true])),
    )
  })

describe('useArrayElementActions', () => {
  beforeEach(() => {
    apiService.delete = jest
      .fn()
      .mockResolvedValue({ status: 200, data: { affected: '1' } })
    apiService.post = jest
      .fn()
      .mockResolvedValue({ status: 200, data: { keyName: KEY, count: '1' } })
  })

  it('drops selected rows once a new result set scrolls them out of view', () => {
    const { result, setElements } = renderActions([
      arrayElementWithValueFactory.build({ index: '1' }),
      arrayElementWithValueFactory.build({ index: '2' }),
      arrayElementWithValueFactory.build({ index: '3' }),
    ])

    selectAll(result, ['1', '2', '3'])
    expect(result.current.bulkDeleteConfig.selectedCount).toBe(3)

    // A new range/search replaces the rendered elements entirely.
    setElements([
      arrayElementWithValueFactory.build({ index: '10' }),
      arrayElementWithValueFactory.build({ index: '11' }),
    ])
    expect(result.current.bulkDeleteConfig.selectedCount).toBe(0)
  })

  it('does not resurrect a stale selection when the index reappears later', () => {
    const { result, setElements } = renderActions([
      arrayElementWithValueFactory.build({ index: '5' }),
    ])

    selectAll(result, ['5'])
    expect(result.current.bulkDeleteConfig.selectedCount).toBe(1)

    // Index 5 leaves the current view (a new range/search)...
    setElements([arrayElementWithValueFactory.build({ index: '9' })])
    expect(result.current.bulkDeleteConfig.selectedCount).toBe(0)

    // ...and later reappears in another result set: it must NOT come back
    // selected without a fresh user selection.
    setElements([arrayElementWithValueFactory.build({ index: '5' })])
    expect(result.current.bulkDeleteConfig.selectedCount).toBe(0)
  })

  it('keeps still-visible selections and bulk-deletes only those indexes', async () => {
    const { result, setElements } = renderActions([
      arrayElementWithValueFactory.build({ index: '1' }),
      arrayElementWithValueFactory.build({ index: '2' }),
      arrayElementWithValueFactory.build({ index: '3' }),
    ])

    selectAll(result, ['1', '2', '3'])

    // A refresh keeps 1 and 2 but drops 3 from the current view.
    setElements([
      arrayElementWithValueFactory.build({ index: '1' }),
      arrayElementWithValueFactory.build({ index: '2' }),
    ])
    expect(result.current.bulkDeleteConfig.selectedCount).toBe(2)

    await act(async () => {
      await result.current.bulkDeleteConfig.handleBulkDelete()
    })

    expect(apiService.delete).toHaveBeenCalledWith(
      expect.stringContaining('array/elements'),
      expect.objectContaining({
        data: { keyName: keyBuffer, indexes: ['1', '2'] },
      }),
    )
    // Cleared on success so the header trigger vanishes right away (no window
    // to re-delete before the refresh lands).
    expect(result.current.bulkDeleteConfig.selectedCount).toBe(0)
  })

  it('keeps the selection when the bulk delete fails, so it can be retried', async () => {
    const { result } = renderActions([
      arrayElementWithValueFactory.build({ index: '1' }),
      arrayElementWithValueFactory.build({ index: '2' }),
    ])

    selectAll(result, ['1', '2'])
    apiService.delete = jest.fn().mockRejectedValue(new Error('boom'))

    await act(async () => {
      await result.current.bulkDeleteConfig.handleBulkDelete()
    })

    expect(result.current.bulkDeleteConfig.selectedCount).toBe(2)
  })

  it('drops a per-row-deleted index from the multi-selection on success', async () => {
    const { result } = renderActions([
      arrayElementWithValueFactory.build({ index: '1' }),
      arrayElementWithValueFactory.build({ index: '2' }),
    ])

    selectAll(result, ['1', '2'])
    expect(result.current.bulkDeleteConfig.selectedCount).toBe(2)

    // Deleting a still-selected row via its own trash removes it from the bulk
    // selection, so the header can't re-delete it before the refresh prunes it.
    await act(async () => {
      await result.current.deleteConfig.handleDeleteElement('1')
    })

    expect(result.current.bulkDeleteConfig.selectedCount).toBe(1)
  })

  it('never fires a bulk delete once every selected row is out of view', async () => {
    const { result, setElements } = renderActions([
      arrayElementWithValueFactory.build({ index: '1' }),
      arrayElementWithValueFactory.build({ index: '2' }),
    ])

    selectAll(result, ['1', '2'])
    setElements([arrayElementWithValueFactory.build({ index: '9' })])

    await act(async () => {
      await result.current.bulkDeleteConfig.handleBulkDelete()
    })

    expect(apiService.delete).not.toHaveBeenCalled()
  })

  it('ignores a second bulk delete while the first is in flight', async () => {
    const { result } = renderActions([
      arrayElementWithValueFactory.build({ index: '1' }),
      arrayElementWithValueFactory.build({ index: '2' }),
    ])

    selectAll(result, ['1', '2'])

    // Two confirms in the same tick (e.g. a double-click) must not
    // double-dispatch: the in-flight guard drops the second.
    await act(async () => {
      result.current.bulkDeleteConfig.handleBulkDelete()
      await result.current.bulkDeleteConfig.handleBulkDelete()
    })

    expect(apiService.delete).toHaveBeenCalledTimes(1)
  })

  it('blocks a bulk delete over the endpoint cap with an error, no request', async () => {
    // Cap is mocked to 5 at the top of this file; select 6.
    const { result, store } = renderActions(
      Array.from({ length: 6 }, (_, i) =>
        arrayElementWithValueFactory.build({ index: String(i) }),
      ),
    )
    selectAll(result, ['0', '1', '2', '3', '4', '5'])
    expect(result.current.bulkDeleteConfig.selectedCount).toBe(6)

    await act(async () => {
      await result.current.bulkDeleteConfig.handleBulkDelete()
    })

    expect(apiService.delete).not.toHaveBeenCalled()
    expect(
      store.getActions().some((a) => a.type === addErrorNotification.type),
    ).toBe(true)
  })

  it('excludes empty View slots from the selection', () => {
    const { result } = renderActions(
      [
        arrayElementWithValueFactory.build({ index: '1' }),
        arrayElementFactory.build({ index: '2' }), // gap: value == null
      ],
      true,
    )

    // Even if a stale/forced selection includes the gap, it isn't counted.
    selectAll(result, ['1', '2'])
    expect(result.current.bulkDeleteConfig.selectedCount).toBe(1)
  })
})
