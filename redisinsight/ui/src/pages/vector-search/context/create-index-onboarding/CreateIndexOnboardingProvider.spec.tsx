import React from 'react'
import { faker } from '@faker-js/faker'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import BrowserStorageItem from 'uiSrc/constants/storage'
import { localStorageService } from 'uiSrc/services'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { CreateIndexOnboardingStep } from '../../components/create-index-onboarding/CreateIndexOnboarding.constants'
import { SearchOnboardingAction } from '../../telemetry.constants'
import { CreateIndexOnboardingProvider } from './CreateIndexOnboardingProvider'
import { useCreateIndexOnboarding } from './CreateIndexOnboardingContext'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  localStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const TestConsumer = () => {
  const {
    currentStep,
    isActive,
    startOnboarding,
    nextStep,
    prevStep,
    skipOnboarding,
  } = useCreateIndexOnboarding()

  return (
    <div>
      <span data-testid="current-step">{currentStep ?? 'null'}</span>
      <span data-testid="is-active">{String(isActive)}</span>
      <button type="button" data-testid="start" onClick={startOnboarding}>
        Start
      </button>
      <button type="button" data-testid="next" onClick={nextStep}>
        Next
      </button>
      <button type="button" data-testid="prev" onClick={prevStep}>
        Prev
      </button>
      <button type="button" data-testid="skip" onClick={skipOnboarding}>
        Skip
      </button>
    </div>
  )
}

const mockInstanceId = faker.string.uuid()
const mockLocalStorageGet = localStorageService.get as jest.Mock
const mockSendEventTelemetry = sendEventTelemetry as jest.Mock

describe('CreateIndexOnboardingProvider', () => {
  const renderComponent = (instanceId = mockInstanceId) =>
    render(
      <CreateIndexOnboardingProvider instanceId={instanceId}>
        <TestConsumer />
      </CreateIndexOnboardingProvider>,
    )

  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorageGet.mockReturnValue(null)
  })

  it('should start inactive with no current step', () => {
    renderComponent()

    const currentStep = screen.getByTestId('current-step')
    const isActive = screen.getByTestId('is-active')

    expect(currentStep).toHaveTextContent('null')
    expect(isActive).toHaveTextContent('false')
  })

  it('should start onboarding at DefineIndex step', () => {
    renderComponent()

    const startButton = screen.getByTestId('start')
    fireEvent.click(startButton)

    const currentStep = screen.getByTestId('current-step')
    const isActive = screen.getByTestId('is-active')

    expect(currentStep).toHaveTextContent(CreateIndexOnboardingStep.DefineIndex)
    expect(isActive).toHaveTextContent('true')
  })

  it('should not start onboarding if already seen', () => {
    mockLocalStorageGet.mockReturnValue(true)

    renderComponent()

    const startButton = screen.getByTestId('start')
    fireEvent.click(startButton)

    const currentStep = screen.getByTestId('current-step')
    const isActive = screen.getByTestId('is-active')

    expect(currentStep).toHaveTextContent('null')
    expect(isActive).toHaveTextContent('false')
  })

  it('should not start onboarding twice', () => {
    renderComponent()

    const startButton = screen.getByTestId('start')
    fireEvent.click(startButton)
    fireEvent.click(startButton)

    const currentStep = screen.getByTestId('current-step')

    expect(currentStep).toHaveTextContent(CreateIndexOnboardingStep.DefineIndex)
  })

  it('should advance through steps with nextStep', () => {
    renderComponent()

    const startButton = screen.getByTestId('start')
    const nextButton = screen.getByTestId('next')
    const currentStep = screen.getByTestId('current-step')

    fireEvent.click(startButton)
    expect(currentStep).toHaveTextContent(CreateIndexOnboardingStep.DefineIndex)

    fireEvent.click(nextButton)
    expect(currentStep).toHaveTextContent(CreateIndexOnboardingStep.IndexPrefix)

    fireEvent.click(nextButton)
    expect(currentStep).toHaveTextContent(CreateIndexOnboardingStep.FieldName)
  })

  it('should complete and persist after last step', () => {
    renderComponent()

    const startButton = screen.getByTestId('start')
    const nextButton = screen.getByTestId('next')
    const isActive = screen.getByTestId('is-active')

    fireEvent.click(startButton)

    for (let i = 0; i < 6; i++) {
      fireEvent.click(nextButton)
    }

    expect(localStorageService.set).toHaveBeenCalledWith(
      BrowserStorageItem.vectorSearchCreateIndexOnboarding,
      true,
    )
    expect(isActive).toHaveTextContent('false')
  })

  it('should skip and persist on skipOnboarding', () => {
    renderComponent()

    const startButton = screen.getByTestId('start')
    const skipButton = screen.getByTestId('skip')
    const isActive = screen.getByTestId('is-active')

    fireEvent.click(startButton)
    fireEvent.click(skipButton)

    expect(localStorageService.set).toHaveBeenCalledWith(
      BrowserStorageItem.vectorSearchCreateIndexOnboarding,
      true,
    )
    expect(isActive).toHaveTextContent('false')
  })

  it('should go back to previous step with prevStep', () => {
    renderComponent()

    const startButton = screen.getByTestId('start')
    const nextButton = screen.getByTestId('next')
    const prevButton = screen.getByTestId('prev')
    const currentStep = screen.getByTestId('current-step')

    fireEvent.click(startButton)
    fireEvent.click(nextButton)
    expect(currentStep).toHaveTextContent(CreateIndexOnboardingStep.IndexPrefix)

    fireEvent.click(prevButton)
    expect(currentStep).toHaveTextContent(CreateIndexOnboardingStep.DefineIndex)
  })

  it('should stay on first step when prevStep is called', () => {
    renderComponent()

    const startButton = screen.getByTestId('start')
    const prevButton = screen.getByTestId('prev')
    const currentStep = screen.getByTestId('current-step')

    fireEvent.click(startButton)
    expect(currentStep).toHaveTextContent(CreateIndexOnboardingStep.DefineIndex)

    fireEvent.click(prevButton)
    expect(currentStep).toHaveTextContent(CreateIndexOnboardingStep.DefineIndex)
  })

  describe('edge cases', () => {
    it('should no-op nextStep when not active', () => {
      renderComponent()

      const nextButton = screen.getByTestId('next')
      const isActive = screen.getByTestId('is-active')

      fireEvent.click(nextButton)

      expect(isActive).toHaveTextContent('false')
      expect(localStorageService.set).not.toHaveBeenCalled()
    })

    it('should no-op prevStep when not active', () => {
      renderComponent()

      const prevButton = screen.getByTestId('prev')
      const isActive = screen.getByTestId('is-active')

      fireEvent.click(prevButton)

      expect(isActive).toHaveTextContent('false')
    })

    it('should no-op skipOnboarding when not active', () => {
      renderComponent()

      const skipButton = screen.getByTestId('skip')
      const isActive = screen.getByTestId('is-active')

      fireEvent.click(skipButton)

      expect(isActive).toHaveTextContent('false')
      expect(localStorageService.set).not.toHaveBeenCalled()
    })
  })

  describe('telemetry', () => {
    it('should send STARTED event when onboarding begins', () => {
      renderComponent()

      const startButton = screen.getByTestId('start')
      fireEvent.click(startButton)

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_CREATE_INDEX_ONBOARDING_STARTED,
        eventData: { databaseId: mockInstanceId },
      })
    })

    it('should not send STARTED event if already seen', () => {
      mockLocalStorageGet.mockReturnValue(true)

      renderComponent()

      const startButton = screen.getByTestId('start')
      fireEvent.click(startButton)

      expect(sendEventTelemetry).not.toHaveBeenCalled()
    })

    it('should send STEP_CLICKED with action next on nextStep', () => {
      renderComponent()

      const startButton = screen.getByTestId('start')
      const nextButton = screen.getByTestId('next')

      fireEvent.click(startButton)
      mockSendEventTelemetry.mockClear()

      fireEvent.click(nextButton)

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_CREATE_INDEX_ONBOARDING_STEP_CLICKED,
        eventData: {
          databaseId: mockInstanceId,
          step: CreateIndexOnboardingStep.DefineIndex,
          action: SearchOnboardingAction.Next,
        },
      })
    })

    it('should send STEP_CLICKED with action back on prevStep', () => {
      renderComponent()

      const startButton = screen.getByTestId('start')
      const nextButton = screen.getByTestId('next')
      const prevButton = screen.getByTestId('prev')

      fireEvent.click(startButton)
      fireEvent.click(nextButton)
      mockSendEventTelemetry.mockClear()

      fireEvent.click(prevButton)

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_CREATE_INDEX_ONBOARDING_STEP_CLICKED,
        eventData: {
          databaseId: mockInstanceId,
          step: CreateIndexOnboardingStep.IndexPrefix,
          action: SearchOnboardingAction.Back,
        },
      })
    })

    it('should send STEP_CLICKED with action skip when skipping mid-tour', () => {
      renderComponent()

      const startButton = screen.getByTestId('start')
      const nextButton = screen.getByTestId('next')
      const skipButton = screen.getByTestId('skip')

      fireEvent.click(startButton)
      fireEvent.click(nextButton)
      mockSendEventTelemetry.mockClear()

      fireEvent.click(skipButton)

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_CREATE_INDEX_ONBOARDING_STEP_CLICKED,
        eventData: {
          databaseId: mockInstanceId,
          step: CreateIndexOnboardingStep.IndexPrefix,
          action: SearchOnboardingAction.Skip,
        },
      })
    })

    it('should send COMPLETED event when finishing the last step', () => {
      renderComponent()

      const startButton = screen.getByTestId('start')
      const nextButton = screen.getByTestId('next')
      const skipButton = screen.getByTestId('skip')

      fireEvent.click(startButton)

      for (let i = 0; i < 5; i++) {
        fireEvent.click(nextButton)
      }

      mockSendEventTelemetry.mockClear()

      fireEvent.click(skipButton)

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.SEARCH_CREATE_INDEX_ONBOARDING_COMPLETED,
        eventData: { databaseId: mockInstanceId },
      })
    })

    it('should not send telemetry when actions are no-ops', () => {
      renderComponent()

      const nextButton = screen.getByTestId('next')
      const prevButton = screen.getByTestId('prev')
      const skipButton = screen.getByTestId('skip')

      fireEvent.click(nextButton)
      fireEvent.click(prevButton)
      fireEvent.click(skipButton)

      expect(sendEventTelemetry).not.toHaveBeenCalled()
    })
  })
})
