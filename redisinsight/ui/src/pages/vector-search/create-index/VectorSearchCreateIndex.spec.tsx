import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/analytics/dbAnalysisHistoryHandlers'
import { VectorSearchCreateIndex } from './VectorSearchCreateIndex'

// Mock the telemetry module, so we don't send actual telemetry data during tests
jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const renderVectorSearchCreateIndexComponent = () =>
  render(<VectorSearchCreateIndex />)

describe('VectorSearchCreateIndex', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render correctly', () => {
    const { container } = renderVectorSearchCreateIndexComponent()

    expect(container).toBeInTheDocument()
  })

  describe('Telemetry', () => {
    it('should send telemetry events on start step', () => {
      renderVectorSearchCreateIndexComponent()

      expect(sendEventTelemetry).toHaveBeenCalledTimes(1)
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.VECTOR_SEARCH_ONBOARDING_TRIGGERED,
        eventData: { databaseId: INSTANCE_ID_MOCK },
      })
    })
  })
})
