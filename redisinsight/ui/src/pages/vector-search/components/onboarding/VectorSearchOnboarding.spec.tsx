import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { VectorSearchOnboarding } from './VectorSearchOnboarding'
import { INSTANCE_ID_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import {
  VectorSearchOnboardingContext,
  VectorSearchOnboardingContextType,
} from '../../context/VectorSearchOnboardingContext'

// Mock the telemetry module, so we don't send actual telemetry data during tests
jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const renderVectorSearchOnboardingComponent = (
  contextValue?: Partial<VectorSearchOnboardingContextType>,
) => {
  const defaultContextValue: VectorSearchOnboardingContextType = {
    showOnboarding: false,
    setOnboardingSeen: jest.fn(),
    setOnboardingSeenSilent: jest.fn(),
    ...contextValue,
  }

  return render(
    <VectorSearchOnboardingContext.Provider value={defaultContextValue}>
      <VectorSearchOnboarding />
    </VectorSearchOnboardingContext.Provider>,
  )
}

describe('VectorSearchOnboarding', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render onboarding content', () => {
    const mockMarkOnboardingAsSeenSilent = jest.fn()

    renderVectorSearchOnboardingComponent({
      showOnboarding: true,
      setOnboardingSeenSilent: mockMarkOnboardingAsSeenSilent,
    })

    const container = screen.getByTestId('vector-search-onboarding')
    expect(container).toBeInTheDocument()

    // Verify that the content sections are rendered correctly
    const header = screen.getByTestId('vector-search-onboarding--header')
    const features = screen.getByTestId('vector-search-onboarding--features')
    const stepper = screen.getByTestId('vector-search-onboarding--stepper')
    const actions = screen.getByTestId('vector-search-onboarding--actions')
    const footer = screen.getByTestId('vector-search-onboarding--footer')

    expect(header).toBeInTheDocument()
    expect(features).toBeInTheDocument()
    expect(stepper).toBeInTheDocument()
    expect(actions).toBeInTheDocument()
    expect(footer).toBeInTheDocument()

    // Verify the onboarding was marked as seen
    expect(mockMarkOnboardingAsSeenSilent).toHaveBeenCalledTimes(1)

    // Verify telemetry event was sent
    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.VECTOR_SEARCH_INITIAL_MESSAGE_DISPLAYED,
      eventData: { databaseId: INSTANCE_ID_MOCK },
    })
  })

  it('should dismiss the onboarding when the "X" button is clicked', () => {
    const mockSetOnboardingSeen = jest.fn()

    renderVectorSearchOnboardingComponent({
      showOnboarding: true,
      setOnboardingSeen: mockSetOnboardingSeen,
    })

    const dismissButton = screen.getByTestId(
      'vector-search-onboarding--dismiss-button',
    )
    expect(dismissButton).toBeInTheDocument()

    // Simulate button click and verify the function is called
    dismissButton.click()
    expect(mockSetOnboardingSeen).toHaveBeenCalled()
  })
})
