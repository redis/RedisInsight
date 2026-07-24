import { cloneDeep } from 'lodash'
import { act } from '@testing-library/react'

import { renderHook, mockedStore, mockStore } from 'uiSrc/utils/test-utils'
import { setViewFormat } from 'uiSrc/slices/browser/keys'
import { KeyValueFormat } from 'uiSrc/constants'
import { useNonUnicodeEditGuard } from './useNonUnicodeEditGuard'

const makeStore = (viewFormat: KeyValueFormat) => {
  const state = cloneDeep(mockedStore.getState())
  state.browser.keys.selectedKey.viewFormat = viewFormat
  return mockStore(state)
}

describe('useNonUnicodeEditGuard', () => {
  it('runs the edit immediately when Unicode is selected', () => {
    const store = makeStore(KeyValueFormat.Unicode)
    const proceed = jest.fn()

    const { result } = renderHook(() => useNonUnicodeEditGuard(), { store })

    act(() => result.current.requestEdit(proceed))

    expect(proceed).toHaveBeenCalledTimes(1)
    expect(result.current.isOpen).toBe(false)
  })

  it('treats a missing format as Unicode and edits immediately', () => {
    const state = cloneDeep(mockedStore.getState())
    const selectedKey = state.browser.keys.selectedKey as {
      viewFormat?: KeyValueFormat
    }
    delete selectedKey.viewFormat
    const store = mockStore(state)
    const proceed = jest.fn()

    const { result } = renderHook(() => useNonUnicodeEditGuard(), { store })

    act(() => result.current.requestEdit(proceed))

    expect(proceed).toHaveBeenCalledTimes(1)
    expect(result.current.isOpen).toBe(false)
  })

  it('runs the edit immediately for a non-editable format (e.g. HEX)', () => {
    const store = makeStore(KeyValueFormat.HEX)
    const proceed = jest.fn()

    const { result } = renderHook(() => useNonUnicodeEditGuard(), { store })

    act(() => result.current.requestEdit(proceed))

    expect(proceed).toHaveBeenCalledTimes(1)
    expect(result.current.isOpen).toBe(false)
  })

  it('defers the edit and opens the popover for a non-Unicode format', () => {
    const store = makeStore(KeyValueFormat.JSON)
    const proceed = jest.fn()

    const { result } = renderHook(() => useNonUnicodeEditGuard(), { store })

    act(() => result.current.requestEdit(proceed))

    expect(proceed).not.toHaveBeenCalled()
    expect(result.current.isOpen).toBe(true)
  })

  it('runs the deferred edit and closes on "Edit anyway"', () => {
    const store = makeStore(KeyValueFormat.JSON)
    const proceed = jest.fn()

    const { result } = renderHook(() => useNonUnicodeEditGuard(), { store })

    act(() => result.current.requestEdit(proceed))
    act(() => result.current.editAnyway())

    expect(proceed).toHaveBeenCalledTimes(1)
    expect(result.current.isOpen).toBe(false)
  })

  it('switches to Unicode and re-enters edit on "Change to Unicode"', () => {
    jest.useFakeTimers()
    const store = makeStore(KeyValueFormat.JSON)
    const proceed = jest.fn()

    const { result } = renderHook(() => useNonUnicodeEditGuard(), { store })

    act(() => result.current.requestEdit(proceed))
    act(() => result.current.changeToUnicode())

    expect(result.current.isOpen).toBe(false)
    expect(store.getActions()).toContainEqual(
      setViewFormat(KeyValueFormat.Unicode),
    )
    // The edit is deferred until the table finishes its format reset.
    expect(proceed).not.toHaveBeenCalled()

    act(() => jest.runAllTimers())

    expect(proceed).toHaveBeenCalledTimes(1)
    jest.useRealTimers()
  })

  it('switches to Unicode without re-entering when reenterAfterUnicode is false', () => {
    jest.useFakeTimers()
    const store = makeStore(KeyValueFormat.JSON)
    const proceed = jest.fn()

    const { result } = renderHook(
      () => useNonUnicodeEditGuard({ reenterAfterUnicode: false }),
      { store },
    )

    act(() => result.current.requestEdit(proceed))
    act(() => result.current.changeToUnicode())

    expect(store.getActions()).toContainEqual(
      setViewFormat(KeyValueFormat.Unicode),
    )

    act(() => jest.runAllTimers())

    expect(proceed).not.toHaveBeenCalled()
    jest.useRealTimers()
  })

  it('discards the edit and closes on Cancel', () => {
    const store = makeStore(KeyValueFormat.JSON)
    const proceed = jest.fn()

    const { result } = renderHook(() => useNonUnicodeEditGuard(), { store })

    act(() => result.current.requestEdit(proceed))
    act(() => result.current.cancel())

    expect(proceed).not.toHaveBeenCalled()
    expect(result.current.isOpen).toBe(false)
  })
})
