import saveAs from 'file-saver'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { dispatch } from 'uiSrc/slices/store'
import { Instance } from 'uiSrc/slices/interfaces'

import { handleDeleteInstances, handleExportInstances } from './handlers'

// Mocks
jest.mock('uiSrc/slices/store', () => ({
  dispatch: jest.fn(),
}))

jest.mock('uiSrc/telemetry', () => {
  const actual = jest.requireActual('uiSrc/telemetry')
  return { ...actual, sendEventTelemetry: jest.fn() }
})

const mockDeleteInstancesAction = jest.fn(
  (instances: Instance[], cb?: () => void) => ({
    type: 'MOCK_DELETE',
    payload: { instances, cb },
  }),
)
const mockExportInstancesAction = jest.fn(
  (
    ids: string[],
    withSecrets: boolean,
    onSuccess?: (data: any) => void,
    onFail?: () => void,
  ) => {
    // Return a dummy action object; tests will trigger callbacks manually
    return {
      type: 'MOCK_EXPORT',
      payload: { ids, withSecrets, onSuccess, onFail },
    }
  },
)

jest.mock('uiSrc/slices/instances/instances', () => ({
  deleteInstancesAction: (...args: any[]) =>
    // @ts-expect-error
    mockDeleteInstancesAction(...(args as any)),
  exportInstancesAction: (...args: any[]) =>
    // @ts-expect-error
    mockExportInstancesAction(...(args as any)),
}))

jest.mock('file-saver', () => ({ __esModule: true, default: jest.fn() }))

const instances: Instance[] = [
  { id: '1', name: 'A', host: 'h1', port: 6379, modules: [], version: null },
  { id: '2', name: 'B', host: 'h2', port: 6380, modules: [], version: null },
]

describe('BulkItemsActions handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('handleDeleteInstances should dispatch delete and send telemetry for multiple', () => {
    handleDeleteInstances(instances)

    expect(mockDeleteInstancesAction).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'MOCK_DELETE' }),
    )

    expect(sendEventTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({
        event:
          TelemetryEvent.CONFIG_DATABASES_MULTIPLE_DATABASES_DELETE_CLICKED,
        eventData: { ids: ['1', '2'] },
      }),
    )
  })

  it('handleDeleteInstances should not send multiple-delete telemetry for single', () => {
    handleDeleteInstances([instances[0]])

    expect(mockDeleteInstancesAction).toHaveBeenCalled()
    expect(sendEventTelemetry).not.toHaveBeenCalledWith(
      expect.objectContaining({
        event:
          TelemetryEvent.CONFIG_DATABASES_MULTIPLE_DATABASES_DELETE_CLICKED,
      }),
    )
  })

  it('handleExportInstances should dispatch export and call saveAs on success', () => {
    const withSecrets = true

    handleExportInstances(instances, withSecrets)

    expect(mockExportInstancesAction).toHaveBeenCalledWith(
      ['1', '2'],
      withSecrets,
      expect.any(Function),
      expect.any(Function),
    )

    // Simulate success callback
    const action = mockExportInstancesAction.mock.results[0].value as any
    action.payload.onSuccess?.({ foo: 'bar' })

    expect(saveAs).toHaveBeenCalled()
    // Second arg should be filename with prefix
    expect((saveAs as unknown as jest.Mock).mock.calls[0][1]).toMatch(
      /RedisInsight_connections_\d+\.json/,
    )

    // Should send click + success telemetry
    expect((sendEventTelemetry as jest.Mock).mock.calls[0][0]).toEqual(
      expect.objectContaining({
        event: TelemetryEvent.CONFIG_DATABASES_REDIS_EXPORT_CLICKED,
      }),
    )
    expect((sendEventTelemetry as jest.Mock).mock.calls[1][0]).toEqual(
      expect.objectContaining({
        event: TelemetryEvent.CONFIG_DATABASES_REDIS_EXPORT_SUCCEEDED,
        eventData: { numberOfDatabases: 2 },
      }),
    )
  })

  it('handleExportInstances should call failure telemetry on fail', () => {
    handleExportInstances(instances, false)

    const action = mockExportInstancesAction.mock.results[0].value as any
    action.payload.onFail?.()

    expect(sendEventTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({
        event: TelemetryEvent.CONFIG_DATABASES_REDIS_EXPORT_FAILED,
        eventData: { numberOfDatabases: 2 },
      }),
    )
  })
})
