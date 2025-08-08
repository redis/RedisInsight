import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import {
  collectQueryToggleFullScreenTelemetry,
  collectTelemetryQueryClear,
  collectTelemetryQueryClearAll,
  collectTelemetryQueryReRun,
  collectTelemetryQueryRun,
} from './telemetry'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

// Mock the telemetry module, so we don't send actual telemetry data during tests
jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('telemetry', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('collectTelemetryQueryRun', () => {
    it('should collect telemetry for query run', () => {
      const instanceId = INSTANCE_ID_MOCK
      const query = 'TEST_QUERY'

      collectTelemetryQueryRun({
        instanceId,
        query,
      })

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_COMMAND_SUBMITTED,
        eventData: {
          databaseId: instanceId,
          commands: [query],
        },
      })
    })
  })

  describe('collectTelemetryQueryReRun', () => {
    it('should collect telemetry for query re-run', () => {
      const instanceId = INSTANCE_ID_MOCK
      const query = 'TEST_QUERY'

      collectTelemetryQueryReRun({
        instanceId,
        query,
      })

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_COMMAND_RUN_AGAIN,
        eventData: {
          databaseId: instanceId,
          commands: [query],
        },
      })
    })
  })

  describe('collectTelemetryQueryClearAll', () => {
    it('should collect telemetry for clearing all queries', () => {
      const instanceId = INSTANCE_ID_MOCK

      collectTelemetryQueryClearAll({
        instanceId,
      })

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_CLEAR_ALL_RESULTS_CLICKED,
        eventData: {
          databaseId: instanceId,
        },
      })
    })
  })

  describe('collectTelemetryQueryClear', () => {
    it('should collect telemetry for clearing a query', () => {
      const instanceId = INSTANCE_ID_MOCK

      collectTelemetryQueryClear({
        instanceId,
      })

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_CLEAR_EDITOR_CLICKED,
        eventData: {
          databaseId: instanceId,
        },
      })
    })
  })

  describe('collectQueryToggleFullScreenTelemetry', () => {
    it('should collect telemetry for opening full screen', () => {
      const instanceId = INSTANCE_ID_MOCK
      const isFullScreen = true

      collectQueryToggleFullScreenTelemetry({
        instanceId,
        isFullScreen,
      })

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_RESULTS_IN_FULL_SCREEN,
        eventData: {
          databaseId: instanceId,
          state: 'Open',
        },
      })
    })

    it('should collect telemetry for closing full screen', () => {
      const instanceId = INSTANCE_ID_MOCK
      const isFullScreen = false

      collectQueryToggleFullScreenTelemetry({
        instanceId,
        isFullScreen,
      })

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_RESULTS_IN_FULL_SCREEN,
        eventData: {
          databaseId: instanceId,
          state: 'Close',
        },
      })
    })
  })
})
