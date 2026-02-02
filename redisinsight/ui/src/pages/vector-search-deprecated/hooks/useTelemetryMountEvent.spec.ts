import { renderHook, cleanup } from 'uiSrc/utils/test-utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { useTelemetryMountEvent } from './useTelemetryMountEvent'

// Mock telemetry sender
jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('useTelemetryMountEvent', () => {
  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('sends telemetry on mount with databaseId and extra event data', () => {
    renderHook(() =>
      useTelemetryMountEvent(
        TelemetryEvent.SEARCH_MANAGE_INDEXES_DRAWER_OPENED,
        undefined,
        { section: 'manage-indexes' },
      ),
    )

    expect(sendEventTelemetry).toHaveBeenCalledTimes(1)
    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_MANAGE_INDEXES_DRAWER_OPENED,
      eventData: { databaseId: 'instanceId', section: 'manage-indexes' },
    })
  })

  it('sends telemetry on unmount when onUnmountEvent is provided', () => {
    const { unmount } = renderHook(() =>
      useTelemetryMountEvent(
        TelemetryEvent.SEARCH_MANAGE_INDEXES_DRAWER_OPENED,
        TelemetryEvent.SEARCH_MANAGE_INDEXES_DRAWER_CLOSED,
      ),
    )

    // clear mount call
    ;(sendEventTelemetry as jest.Mock).mockClear()

    unmount()

    expect(sendEventTelemetry).toHaveBeenCalledTimes(1)
    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.SEARCH_MANAGE_INDEXES_DRAWER_CLOSED,
      eventData: { databaseId: 'instanceId' },
    })
  })

  it('does not send telemetry on unmount when onUnmountEvent is not provided', () => {
    const { unmount } = renderHook(() =>
      useTelemetryMountEvent(
        TelemetryEvent.SEARCH_MANAGE_INDEXES_DRAWER_OPENED,
      ),
    )

    // clear mount call
    ;(sendEventTelemetry as jest.Mock).mockClear()

    unmount()

    expect(sendEventTelemetry).not.toHaveBeenCalled()
  })
})
