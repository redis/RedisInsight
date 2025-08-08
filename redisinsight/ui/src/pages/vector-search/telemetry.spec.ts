import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { collectSavedQueriesPanelToggleTelemetry } from './telemetry'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'

// Mock the telemetry module, so we don't send actual telemetry data during tests
jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('telemetry', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('collectSavedQueriesPanelToggleTelemetry', () => {
    it('should collect telemetry for saved queries panel toggle on open', () => {
      const instanceId = INSTANCE_ID_MOCK
      const isSavedQueriesOpen = false

      collectSavedQueriesPanelToggleTelemetry({
        instanceId,
        isSavedQueriesOpen,
      })

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_SAVED_QUERIES_PANEL_OPENED,
        eventData: {
          databaseId: instanceId,
        },
      })
    })

    it('should collect telemetry for saved queries panel toggle on close', () => {
      const instanceId = INSTANCE_ID_MOCK
      const isSavedQueriesOpen = true

      collectSavedQueriesPanelToggleTelemetry({
        instanceId,
        isSavedQueriesOpen,
      })

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_SAVED_QUERIES_PANEL_CLOSED,
        eventData: {
          databaseId: instanceId,
        },
      })
    })
  })
})
