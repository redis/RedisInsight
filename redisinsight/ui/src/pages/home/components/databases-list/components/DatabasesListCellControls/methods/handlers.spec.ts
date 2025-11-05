import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { dispatch } from 'uiSrc/slices/store'
import { Instance } from 'uiSrc/slices/interfaces'

import {
  handleDeleteInstances,
  handleClickDeleteInstance,
  handleClickGoToCloud,
  handleClickEditInstance,
  handleManageInstanceTags,
} from './handlers'

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
const mockFetchEditedInstanceAction = jest.fn((instance: Instance) => ({
  type: 'MOCK_FETCH_EDITED',
  payload: instance,
}))
const mockSetEditedInstance = jest.fn((instance: Instance | null) => ({
  type: 'MOCK_SET_EDITED',
  payload: instance,
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  deleteInstancesAction: (...args: any[]) =>
    // @ts-expect-error
    mockDeleteInstancesAction(...(args as any)),
  fetchEditedInstanceAction: (...args: any[]) =>
    // @ts-expect-error
    mockFetchEditedInstanceAction(...(args as any)),
  setEditedInstance: (...args: any[]) =>
    // @ts-expect-error
    mockSetEditedInstance(...(args as any)),
}))

const instance: Instance = {
  id: '1',
  name: 'A',
  host: 'h1',
  port: 6379,
  provider: 'LOCALHOST',
  modules: [],
  version: null,
}

describe('DatabasesListCellControls handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('handleDeleteInstances should dispatch delete with single instance', () => {
    handleDeleteInstances(instance)

    expect(mockDeleteInstancesAction).toHaveBeenCalledWith(
      [instance],
      expect.any(Function),
    )
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'MOCK_DELETE' }),
    )
  })

  it('handleClickDeleteInstance should send telemetry', () => {
    handleClickDeleteInstance(instance)

    expect(sendEventTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({
        event: TelemetryEvent.CONFIG_DATABASES_SINGLE_DATABASE_DELETE_CLICKED,
        eventData: expect.objectContaining({
          databaseId: '1',
          provider: 'LOCALHOST',
        }),
      }),
    )
  })

  it('handleClickGoToCloud should send telemetry', () => {
    handleClickGoToCloud()

    expect(sendEventTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({ event: TelemetryEvent.CLOUD_LINK_CLICKED }),
    )
  })

  it('handleClickEditInstance should send telemetry and dispatch fetch', () => {
    handleClickEditInstance(instance)

    expect(sendEventTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({
        event: TelemetryEvent.CONFIG_DATABASES_DATABASE_EDIT_CLICKED,
        eventData: expect.objectContaining({
          databaseId: '1',
          provider: 'LOCALHOST',
        }),
      }),
    )

    expect(mockFetchEditedInstanceAction).toHaveBeenCalledWith(instance)
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'MOCK_FETCH_EDITED' }),
    )
  })

  it('handleManageInstanceTags should send telemetry and set edited instance', () => {
    handleManageInstanceTags(instance)

    expect(sendEventTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({
        event: TelemetryEvent.CONFIG_DATABASES_DATABASE_MANAGE_TAGS_CLICKED,
        eventData: expect.objectContaining({
          databaseId: '1',
          provider: 'LOCALHOST',
        }),
      }),
    )
    expect(mockSetEditedInstance).toHaveBeenCalledWith(instance)
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'MOCK_SET_EDITED' }),
    )
  })
})
