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
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { useArrayAggregateQuery } from './useArrayAggregateQuery'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const mockedSendEventTelemetry = jest.mocked(sendEventTelemetry)

const KEY = 'sensors'
const keyBuffer = stringToBuffer(KEY)
const INSTANCE_ID = 'instance-1'

const buildState = (
  overrides: {
    selectedKeyType?: KeyTypes
    selectedKeyName?: ReturnType<typeof stringToBuffer> | null
  } = {},
) => {
  const next = cloneDeep(initialStateDefault)
  next.browser.array = cloneDeep(initialStateArray)
  next.connections.instances.connectedInstance.id = INSTANCE_ID
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
    mockedSendEventTelemetry.mockClear()
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
    expect(result.current.result).toBeNull()
    expect(result.current.hasResult).toBe(false)
  })

  it('dispatches loadArrayAggregateSuccess with a nil reply forwarded verbatim', async () => {
    // redux-mock-store doesn't run reducers, so we assert on the dispatched
    // success action — the slice spec covers the hasResult flip and the
    // null-result passthrough.
    ;(apiService.post as jest.Mock).mockResolvedValueOnce({
      status: 200,
      data: { result: null },
    })
    const { result, store } = renderWithStore(keyBuffer)
    store.clearActions()

    await act(async () => {
      result.current.runQuery()
    })

    const success = store
      .getActions()
      .find((a) => a.type === 'array/loadArrayAggregateSuccess')
    expect(success).toBeDefined()
    expect(success?.payload).toEqual({ result: null })
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

  describe('telemetry', () => {
    it('fires ARRAY_AGGREGATE_QUERY_RUN once per explicit run with the operation', async () => {
      const { result } = renderWithStore(keyBuffer)

      act(() => {
        result.current.setOperation(ArrayAggregateOperation.Xor)
      })
      mockedSendEventTelemetry.mockClear()

      await act(async () => {
        result.current.runQuery()
      })

      expect(mockedSendEventTelemetry).toHaveBeenCalledTimes(1)
      expect(mockedSendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.ARRAY_AGGREGATE_QUERY_RUN,
        eventData: {
          databaseId: INSTANCE_ID,
          operation: ArrayAggregateOperation.Xor,
        },
      })
    })

    it('does not fire on first render (no auto-run)', () => {
      renderWithStore(keyBuffer)

      expect(mockedSendEventTelemetry).not.toHaveBeenCalled()
    })

    it('does not fire on a dead click before the key is ready', async () => {
      const { result } = renderWithStore(
        keyBuffer,
        buildState({ selectedKeyName: null }),
      )
      mockedSendEventTelemetry.mockClear()

      await act(async () => {
        result.current.runQuery()
      })

      expect(mockedSendEventTelemetry).not.toHaveBeenCalled()
    })

    it('does not fire on resetQuery', () => {
      const { result } = renderWithStore(keyBuffer)
      mockedSendEventTelemetry.mockClear()

      act(() => {
        result.current.resetQuery()
      })

      expect(mockedSendEventTelemetry).not.toHaveBeenCalled()
    })
  })
})
