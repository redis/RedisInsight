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
import { ArrayAggregateOperation } from 'uiSrc/slices/interfaces/array'
import { useArrayAggregateQuery } from './useArrayAggregateQuery'

const KEY = 'sensors'
const keyBuffer = stringToBuffer(KEY)

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
  const { result } = renderHook(() => useArrayAggregateQuery(prop), { store })
  return { result, store }
}

describe('useArrayAggregateQuery', () => {
  beforeEach(() => {
    apiService.post = jest
      .fn()
      .mockResolvedValue({ status: 200, data: { result: '42' } })
  })

  it('initialises form defaults and isArrayKeyReady=true for a matching Array key', () => {
    const { result } = renderWithStore(keyBuffer)

    expect(result.current.start).toBe('0')
    expect(result.current.end).toBe('9')
    expect(result.current.operation).toBe(ArrayAggregateOperation.Sum)
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

  it('does not auto-fire AROP on first ready render (manual Run only)', () => {
    renderWithStore(keyBuffer)

    const call = (apiService.post as jest.Mock).mock.calls.find(([url]) =>
      url.includes('array/aggregate'),
    )
    expect(call).toBeUndefined()
  })

  it('runQuery dispatches AROP with current form values (omits value for non-MATCH ops)', async () => {
    const { result } = renderWithStore(keyBuffer)

    act(() => {
      result.current.setStart('5')
      result.current.setEnd('25')
      result.current.setOperation(ArrayAggregateOperation.Xor)
    })
    ;(apiService.post as jest.Mock).mockClear()

    await act(async () => {
      result.current.runQuery()
    })

    const call = (apiService.post as jest.Mock).mock.calls.find(([url]) =>
      url.includes('array/aggregate'),
    )
    expect(call?.[1]).toEqual({
      keyName: keyBuffer,
      start: '5',
      end: '25',
      operation: ArrayAggregateOperation.Xor,
    })
  })

  it('runQuery includes value when operation is MATCH', async () => {
    const { result } = renderWithStore(keyBuffer)

    act(() => {
      result.current.setOperation(ArrayAggregateOperation.Match)
      result.current.setValue('needle')
    })
    ;(apiService.post as jest.Mock).mockClear()

    await act(async () => {
      result.current.runQuery()
    })

    const call = (apiService.post as jest.Mock).mock.calls.find(([url]) =>
      url.includes('array/aggregate'),
    )
    expect(call?.[1]).toEqual({
      keyName: keyBuffer,
      start: '0',
      end: '9',
      operation: ArrayAggregateOperation.Match,
      value: 'needle',
    })
  })

  it('runQuery is a no-op while isArrayKeyReady=false', async () => {
    const { result } = renderWithStore(
      keyBuffer,
      buildState({ selectedKeyName: null }),
    )
    ;(apiService.post as jest.Mock).mockClear()

    await act(async () => {
      result.current.runQuery()
    })

    expect(apiService.post as jest.Mock).not.toHaveBeenCalled()
  })

  it('resetQuery restores form defaults without firing a request', async () => {
    const { result } = renderWithStore(keyBuffer)

    act(() => {
      result.current.setStart('100')
      result.current.setEnd('200')
      result.current.setOperation(ArrayAggregateOperation.Match)
      result.current.setValue('foo')
    })
    ;(apiService.post as jest.Mock).mockClear()

    act(() => {
      result.current.resetQuery()
    })

    expect(result.current.start).toBe('0')
    expect(result.current.end).toBe('9')
    expect(result.current.operation).toBe(ArrayAggregateOperation.Sum)
    expect(result.current.value).toBe('')
    expect(apiService.post as jest.Mock).not.toHaveBeenCalled()
  })
})
