import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'

import { sendCopyTelemetry, handleCopyToClipboard } from './handlers'

jest.mock('uiSrc/telemetry', () => {
  const actual = jest.requireActual('uiSrc/telemetry')
  return { ...actual, sendEventTelemetry: jest.fn() }
})

describe('DatabasesListCellHost handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(navigator as any).clipboard = { writeText: jest.fn() }
  })

  describe('handleCopy', () => {
    it('should send telemetry with databaseId', () => {
      sendCopyTelemetry('db-1')

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.CONFIG_DATABASES_HOST_PORT_COPIED,
        eventData: { databaseId: 'db-1' },
      })
    })

    it('should send telemetry with undefined databaseId when not provided', () => {
      sendCopyTelemetry()

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.CONFIG_DATABASES_HOST_PORT_COPIED,
        eventData: { databaseId: undefined },
      })
    })
  })

  describe('handleCopyToClipboard', () => {
    it('should stop propagation, copy and send telemetry', () => {
      const stopPropagation = jest.fn()
      const e = { stopPropagation } as any

      handleCopyToClipboard(e, 'host:6379', 'db-1')

      expect(stopPropagation).toHaveBeenCalled()
      expect((navigator as any).clipboard.writeText).toHaveBeenCalledWith(
        'host:6379',
      )
      expect(sendEventTelemetry).toHaveBeenCalledWith(
        expect.objectContaining({
          event: TelemetryEvent.CONFIG_DATABASES_HOST_PORT_COPIED,
          eventData: { databaseId: 'db-1' },
        }),
      )
    })
  })
})
