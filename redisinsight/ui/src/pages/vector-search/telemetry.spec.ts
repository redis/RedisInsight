import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { collectTelemetryQueryReRun } from './telemetry'
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
})
