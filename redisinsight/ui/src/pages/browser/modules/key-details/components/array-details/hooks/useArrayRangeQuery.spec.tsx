import React, { useState } from 'react'
import { Provider } from 'react-redux'
import { cloneDeep } from 'lodash'
import {
  act,
  initialStateDefault,
  mockStore,
  renderHook,
} from 'uiSrc/utils/test-utils'
import { apiService } from 'uiSrc/services'
import { KeyTypes } from 'uiSrc/constants'
import { stringToBuffer } from 'uiSrc/utils'
import {
  initialState as initialStateArray,
  setArrayActiveQuery,
} from 'uiSrc/slices/browser/array'
import { useArrayRangeQuery } from './useArrayRangeQuery'

const KEY = 'readings'
const keyBuffer = stringToBuffer(KEY)

const buildState = (
  overrides: {
    selectedKeyType?: KeyTypes
    selectedKeyName?: ReturnType<typeof stringToBuffer> | null
    activeQuery?: { start: string; end: string; showEmpty: boolean }
  } = {},
) => {
  const next = cloneDeep(initialStateDefault)
  next.browser.array = cloneDeep(initialStateArray)
  if (overrides.activeQuery) {
    next.browser.array.query = overrides.activeQuery
  }
  next.browser.keys.selectedKey.data = overrides.selectedKeyName
    ? ({
        type: overrides.selectedKeyType ?? KeyTypes.Array,
        name: overrides.selectedKeyName,
      } as any)
    : null
  return next
}

const renderWithStore = (
  prop: ReturnType<typeof stringToBuffer> | null,
  state = buildState({ selectedKeyName: keyBuffer }),
) => {
  const store = mockStore(state)
  store.clearActions()
  const { result } = renderHook(() => useArrayRangeQuery(prop), { store })
  return { result, store }
}

describe('useArrayRangeQuery', () => {
  beforeEach(() => {
    apiService.post = jest
      .fn()
      .mockResolvedValue({ status: 200, data: { keyName: KEY, elements: [] } })
  })

  it('initialises form defaults and isArrayKeyReady=true for a matching Array key', () => {
    const { result } = renderWithStore(keyBuffer)

    expect(result.current.start).toBe('0')
    expect(result.current.end).toBe('9')
    expect(result.current.showEmpty).toBe(true)
    expect(result.current.isArrayKeyReady).toBe(true)
  })

  it('isArrayKeyReady=false until selectedKeyData catches up with keyProp', () => {
    const { result } = renderWithStore(
      keyBuffer,
      buildState({ selectedKeyName: null }),
    )

    expect(result.current.isArrayKeyReady).toBe(false)
  })

  it('isArrayKeyReady=false when selected key type is not Array', () => {
    const { result } = renderWithStore(
      keyBuffer,
      buildState({
        selectedKeyName: keyBuffer,
        selectedKeyType: KeyTypes.String,
      }),
    )

    expect(result.current.isArrayKeyReady).toBe(false)
  })

  it('runQuery dispatches ARGETRANGE when showEmpty=true', async () => {
    const { result } = renderWithStore(keyBuffer)
    ;(apiService.post as jest.Mock).mockClear()

    await act(async () => {
      result.current.runQuery('2', '8')
    })

    const call = (apiService.post as jest.Mock).mock.calls.find(([url]) =>
      url.includes('array/get-range'),
    )
    expect(call?.[1]).toEqual({ keyName: keyBuffer, start: '2', end: '8' })
  })

  it('runQuery dispatches ARSCAN when showEmpty=false', async () => {
    const { result } = renderWithStore(keyBuffer)

    act(() => {
      result.current.setShowEmpty(false)
    })
    ;(apiService.post as jest.Mock).mockClear()

    await act(async () => {
      result.current.runQuery('0', '99')
    })

    const call = (apiService.post as jest.Mock).mock.calls.find(([url]) =>
      url.includes('array/scan'),
    )
    expect(call?.[1]).toEqual({
      keyName: keyBuffer,
      start: '0',
      end: '99',
      limit: 1_000_000,
    })
  })

  it('runQuery is a no-op while isArrayKeyReady=false', async () => {
    const { result } = renderWithStore(
      keyBuffer,
      buildState({ selectedKeyName: null }),
    )
    ;(apiService.post as jest.Mock).mockClear()

    await act(async () => {
      result.current.runQuery('0', '9')
    })

    expect(apiService.post as jest.Mock).not.toHaveBeenCalled()
  })

  it('auto-fires the default ARGETRANGE on first ready render for a key', () => {
    renderWithStore(keyBuffer)

    const call = (apiService.post as jest.Mock).mock.calls.find(([url]) =>
      url.includes('array/get-range'),
    )
    expect(call?.[1]).toEqual({ keyName: keyBuffer, start: '0', end: '9' })
  })

  it('honors pre-ready form edits when isArrayKeyReady flips to true', async () => {
    const notReadyStore = mockStore(buildState({ selectedKeyName: null }))
    const readyStore = mockStore(buildState({ selectedKeyName: keyBuffer }))

    let swapStore: React.Dispatch<React.SetStateAction<any>> = () => {}
    const SwappableProvider = ({ children }: { children: React.ReactNode }) => {
      const [store, setStore] = useState<any>(notReadyStore)
      swapStore = setStore
      return <Provider store={store}>{children}</Provider>
    }

    const { result } = renderHook(() => useArrayRangeQuery(keyBuffer), {
      wrapper: SwappableProvider,
    } as any)

    expect(result.current.isArrayKeyReady).toBe(false)

    act(() => {
      result.current.setShowEmpty(false)
      result.current.setStart('5')
      result.current.setEnd('15')
    })
    ;(apiService.post as jest.Mock).mockClear()

    act(() => {
      swapStore(readyStore)
    })

    const scanCall = (apiService.post as jest.Mock).mock.calls.find(([url]) =>
      url.includes('array/scan'),
    )
    expect(scanCall?.[1]).toEqual({
      keyName: keyBuffer,
      start: '5',
      end: '15',
      limit: 1_000_000,
    })

    const rangeCall = (apiService.post as jest.Mock).mock.calls.find(([url]) =>
      url.includes('array/get-range'),
    )
    expect(rangeCall).toBeUndefined()
  })

  it('resetQuery restores defaults and refires the default range', async () => {
    const { result } = renderWithStore(keyBuffer)

    act(() => {
      result.current.setStart('42')
      result.current.setEnd('100')
      result.current.setShowEmpty(false)
    })
    ;(apiService.post as jest.Mock).mockClear()

    await act(async () => {
      result.current.resetQuery()
    })

    expect(result.current.start).toBe('0')
    expect(result.current.end).toBe('9')
    expect(result.current.showEmpty).toBe(true)
    const call = (apiService.post as jest.Mock).mock.calls.find(([url]) =>
      url.includes('array/get-range'),
    )
    expect(call?.[1]).toEqual({ keyName: keyBuffer, start: '0', end: '9' })
  })

  describe('revealIndex', () => {
    it('is a no-op when the index is already within the window', () => {
      const { result, store } = renderWithStore(keyBuffer)
      store.clearActions()

      act(() => {
        result.current.revealIndex('5') // default window is [0, 9]
      })

      expect(result.current.start).toBe('0')
      expect(result.current.end).toBe('9')
      expect(
        store.getActions().some((a) => a.type === setArrayActiveQuery.type),
      ).toBe(false)
    })

    it('moves the window to end at an index above the current range', () => {
      const { result, store } = renderWithStore(keyBuffer)
      store.clearActions()

      act(() => {
        result.current.revealIndex('100')
      })

      // A 10-element window ending at the added index.
      expect(result.current.start).toBe('91')
      expect(result.current.end).toBe('100')
      expect(store.getActions()).toContainEqual(
        setArrayActiveQuery({ start: '91', end: '100', showEmpty: true }),
      )
    })

    it('clamps the window start to 0 near the beginning', () => {
      const { result } = renderWithStore(
        keyBuffer,
        buildState({
          selectedKeyName: keyBuffer,
          activeQuery: { start: '50', end: '60', showEmpty: true },
        }),
      )

      act(() => {
        result.current.revealIndex('3') // below the active window
      })

      expect(result.current.start).toBe('0')
      expect(result.current.end).toBe('3')
    })

    it('reveals against the active query, not the (possibly unrun) form range', () => {
      // The form range would "cover" the index, but the active query — what
      // refreshArray replays — does not, so the element must still be revealed.
      const { result, store } = renderWithStore(
        keyBuffer,
        buildState({
          selectedKeyName: keyBuffer,
          activeQuery: { start: '0', end: '9', showEmpty: true },
        }),
      )

      act(() => {
        result.current.setStart('0')
        result.current.setEnd('1000000') // canonical but unrun (over the cap)
      })
      act(() => {
        result.current.revealIndex('10')
      })

      expect(result.current.start).toBe('1')
      expect(result.current.end).toBe('10')
      expect(store.getActions()).toContainEqual(
        setArrayActiveQuery({ start: '1', end: '10', showEmpty: true }),
      )
    })

    it('syncs showEmpty to the active query mode when revealing', () => {
      const { result, store } = renderWithStore(
        keyBuffer,
        buildState({
          selectedKeyName: keyBuffer,
          activeQuery: { start: '0', end: '9', showEmpty: true },
        }),
      )

      // Toggle the checkbox without running — the reveal fetches with the
      // active mode, so the control must be reset to match it.
      act(() => {
        result.current.setShowEmpty(false)
      })
      act(() => {
        result.current.revealIndex('100')
      })

      expect(result.current.showEmpty).toBe(true)
      expect(store.getActions()).toContainEqual(
        setArrayActiveQuery({ start: '91', end: '100', showEmpty: true }),
      )
    })

    it('reveals without throwing when the active bounds are non-numeric', () => {
      const { result } = renderWithStore(
        keyBuffer,
        buildState({
          selectedKeyName: keyBuffer,
          activeQuery: { start: 'abc', end: '', showEmpty: true },
        }),
      )

      // Must not throw (it runs in the post-add success path) and should move
      // to a valid window ending at the index.
      expect(() =>
        act(() => {
          result.current.revealIndex('100')
        }),
      ).not.toThrow()
      expect(result.current.start).toBe('91')
      expect(result.current.end).toBe('100')
    })

    it('is a no-op for a non-numeric index', () => {
      const { result, store } = renderWithStore(keyBuffer)
      store.clearActions()

      act(() => {
        result.current.revealIndex('not-an-index')
      })

      expect(result.current.start).toBe('0')
      expect(result.current.end).toBe('9')
      expect(
        store.getActions().some((a) => a.type === setArrayActiveQuery.type),
      ).toBe(false)
    })
  })
})
