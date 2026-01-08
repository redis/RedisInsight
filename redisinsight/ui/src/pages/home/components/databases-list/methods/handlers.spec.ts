import {
  TelemetryEvent,
  sendEventTelemetry,
  getRedisInfoSummary,
  getRedisModulesSummary,
} from 'uiSrc/telemetry'
import { dispatch } from 'uiSrc/slices/store'
import { Pages, BrowserStorageItem } from 'uiSrc/constants'

import { handleCheckConnectToInstance, handleSortingChange } from './handlers'

jest.mock('uiSrc/slices/store', () => ({
  dispatch: jest.fn(),
  store: { getState: jest.fn() },
}))

jest.mock('uiSrc/telemetry', () => {
  const actual = jest.requireActual('uiSrc/telemetry')
  return {
    ...actual,
    sendEventTelemetry: jest.fn(),
    getRedisInfoSummary: jest.fn(),
    getRedisModulesSummary: jest.fn(),
  }
})

const mockCheckConnectToInstanceAction = jest.fn(
  (id: string, onSuccess?: (id: string) => void) => {
    onSuccess?.(id) // simulate success immediately
    return { type: 'MOCK_CHECK_CONNECT', payload: { id } }
  },
)
const mockSetConnectedInstanceId = jest.fn((id: string) => ({
  type: 'MOCK_SET_CONN_ID',
  payload: id,
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  checkConnectToInstanceAction: (...args: any[]) =>
    // @ts-expect-error
    mockCheckConnectToInstanceAction(...(args as any)),
  setConnectedInstanceId: (...args: any[]) =>
    // @ts-expect-error
    mockSetConnectedInstanceId(...(args as any)),
}))

const mockResetRdiContext = jest.fn(() => ({ type: 'MOCK_RESET_RDI' }))

jest.mock('uiSrc/slices/app/context', () => ({
  appContextSelector: jest.fn(() => ({ contextInstanceId: 'ctx-1' })),
  // @ts-expect-error
  resetRdiContext: (...args: any[]) => mockResetRdiContext(...(args as any)),
}))

const mockHistoryPush = jest.fn()
jest.mock('uiSrc/Router', () => ({
  navigate: jest.fn((...args) => mockHistoryPush(...args)),
}))

const mockLocalStorageSet = jest.fn()
jest.mock('uiSrc/services', () => {
  const actual = jest.requireActual('uiSrc/services')
  return {
    ...actual,
    localStorageService: {
      ...actual.localStorageService,
      set: (...args: any[]) => mockLocalStorageSet(...(args as any)),
    },
  }
})

const instance = {
  id: '1',
  provider: 'LOCALHOST',
  modules: [],
}

describe('databases-list methods/handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getRedisInfoSummary as jest.Mock).mockResolvedValue({
      redis_version: '7.2',
    })
    ;(getRedisModulesSummary as jest.Mock).mockReturnValue({
      RedisJSON: { loaded: false },
      customModules: [],
    })
  })

  it('handleCheckConnectToInstance should send telemetry and navigate on success', async () => {
    await handleCheckConnectToInstance(instance as any)

    // send telemetry with event
    expect(sendEventTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({
        event: TelemetryEvent.CONFIG_DATABASES_OPEN_DATABASE,
        eventData: expect.objectContaining({
          databaseId: '1',
          provider: 'LOCALHOST',
        }),
      }),
    )

    // dispatch reset and set connected id
    expect(mockResetRdiContext).toHaveBeenCalled()
    expect(mockSetConnectedInstanceId).toHaveBeenCalledWith('1')

    // navigate
    expect(mockHistoryPush).toHaveBeenCalledWith(Pages.browser('1'))

    // check connect action dispatched
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'MOCK_CHECK_CONNECT' }),
    )
  })

  it('handleSortingChange should set sort and send telemetry', () => {
    handleSortingChange([{ id: 'name', desc: false }])

    expect(mockLocalStorageSet).toHaveBeenCalledWith(
      BrowserStorageItem.instancesSorting,
      { field: 'name', direction: 'asc' },
    )
    expect(sendEventTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({
        event: TelemetryEvent.CONFIG_DATABASES_DATABASE_LIST_SORTED,
        eventData: { field: 'name', direction: 'asc' },
      }),
    )
  })

  it('handleSortingChange should do nothing when sorting is empty', () => {
    handleSortingChange([])

    expect(mockLocalStorageSet).not.toHaveBeenCalled()
    expect(sendEventTelemetry).not.toHaveBeenCalled()
  })
})
