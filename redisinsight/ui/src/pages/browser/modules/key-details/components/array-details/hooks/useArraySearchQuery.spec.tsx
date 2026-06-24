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
import { initialState as initialStateArray } from 'uiSrc/slices/browser/array'
import { ArrayGrepCriteria } from 'uiSrc/slices/interfaces/array'
import { useArraySearchQuery } from './useArraySearchQuery'

const KEY = 'readings'
const keyBuffer = stringToBuffer(KEY)
const otherKeyBuffer = stringToBuffer('other')

const buildState = (
  overrides: {
    selectedKeyType?: KeyTypes
    selectedKeyName?: ReturnType<typeof stringToBuffer> | null
  } = {},
) => {
  const next = cloneDeep(initialStateDefault)
  next.browser.array = cloneDeep(initialStateArray)
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
  const view = renderHook((p) => useArraySearchQuery(p as typeof prop), {
    store,
    initialProps: prop,
  } as any)
  return { ...view, store }
}

describe('useArraySearchQuery', () => {
  beforeEach(() => {
    apiService.post = jest
      .fn()
      .mockResolvedValue({ status: 200, data: { keyName: KEY, elements: [] } })
  })

  it('initialises form defaults and isArrayKeyReady=true for a matching Array key', () => {
    const { result } = renderWithStore(keyBuffer)

    expect(result.current.criteria).toBe(ArrayGrepCriteria.Exact)
    expect(result.current.value).toBe('')
    expect(result.current.isArrayKeyReady).toBe(true)
  })

  it('isArrayKeyReady=false until selectedKeyData catches up with keyProp', () => {
    const { result } = renderWithStore(
      keyBuffer,
      buildState({ selectedKeyName: null }),
    )

    expect(result.current.isArrayKeyReady).toBe(false)
  })

  it('isArrayKeyReady=false when the selected key type is not Array', () => {
    const { result } = renderWithStore(
      keyBuffer,
      buildState({
        selectedKeyName: keyBuffer,
        selectedKeyType: KeyTypes.String,
      }),
    )

    expect(result.current.isArrayKeyReady).toBe(false)
  })

  it('does not auto-fire a search on first render (search is user-initiated)', () => {
    renderWithStore(keyBuffer)

    expect(
      (apiService.post as jest.Mock).mock.calls.find(([url]) =>
        url.includes('array/search'),
      ),
    ).toBeUndefined()
  })

  it('runSearch posts a single predicate from the current criteria + value', async () => {
    const { result } = renderWithStore(keyBuffer)

    act(() => {
      result.current.setCriteria(ArrayGrepCriteria.Glob)
      result.current.setValue('redis*')
    })

    await act(async () => {
      result.current.runSearch()
    })

    const call = (apiService.post as jest.Mock).mock.calls.find(([url]) =>
      url.includes('array/search'),
    )
    expect(call?.[1]).toEqual({
      keyName: keyBuffer,
      predicates: [{ criteria: ArrayGrepCriteria.Glob, value: 'redis*' }],
      limit: 1_000_000,
    })
  })

  it('runSearch is a no-op while isArrayKeyReady=false', async () => {
    const { result } = renderWithStore(
      keyBuffer,
      buildState({ selectedKeyName: null }),
    )

    act(() => {
      result.current.setValue('redis')
    })
    await act(async () => {
      result.current.runSearch()
    })

    expect(
      (apiService.post as jest.Mock).mock.calls.find(([url]) =>
        url.includes('array/search'),
      ),
    ).toBeUndefined()
  })

  it('runSearch posts an empty value verbatim — EXACT "" is a valid search', async () => {
    const { result } = renderWithStore(keyBuffer)

    act(() => {
      result.current.setValue('')
    })
    await act(async () => {
      result.current.runSearch()
    })

    const call = (apiService.post as jest.Mock).mock.calls.find(([url]) =>
      url.includes('array/search'),
    )
    expect(call?.[1]).toEqual({
      keyName: keyBuffer,
      predicates: [{ criteria: ArrayGrepCriteria.Exact, value: '' }],
      limit: 1_000_000,
    })
  })

  it('resets the form when the selected key changes', () => {
    const { result, rerender } = renderWithStore(keyBuffer)

    act(() => {
      result.current.setCriteria(ArrayGrepCriteria.Re)
      result.current.setValue('stale')
    })
    expect(result.current.value).toBe('stale')

    act(() => {
      rerender(otherKeyBuffer)
    })

    expect(result.current.value).toBe('')
    expect(result.current.criteria).toBe(ArrayGrepCriteria.Exact)
  })
})
