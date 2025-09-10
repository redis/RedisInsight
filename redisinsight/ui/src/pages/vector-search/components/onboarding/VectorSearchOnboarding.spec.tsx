import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { VectorSearchOnboarding } from './VectorSearchOnboarding'
import useVectorSearchOnboarding from '../../create-index/hooks/useVectorSearchOnboarding'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'

jest.mock('../../create-index/hooks/useVectorSearchOnboarding')

// Mock the telemetry module, so we don't send actual telemetry data during tests
jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const renderVectorSearchOnboardingComponent = () =>
  render(<VectorSearchOnboarding />)

describe('VectorSearchOnboarding', () => {
  const mockMarkOnboardingAsSeen = jest.fn()
  const mockUseVectorSearchOnboarding = useVectorSearchOnboarding as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    mockUseVectorSearchOnboarding.mockReturnValue({
      showOnboarding: true,
      markOnboardingAsSeen: mockMarkOnboardingAsSeen,
    })
  })

  it('should render onboarding content', () => {
    renderVectorSearchOnboardingComponent()

    const container = screen.getByTestId('vector-search-onboarding')
    expect(container).toBeInTheDocument()

    // Verify the onboarding was marked as seen
    expect(mockMarkOnboardingAsSeen).toHaveBeenCalledTimes(1)

    // Verify telemetry event was sent
    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.VECTOR_SEARCH_INITIAL_MESSAGE_DISPLAYED,
      eventData: { databaseId: INSTANCE_ID_MOCK },
    })
  })
})
