import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import BrowserStorageItem from 'uiSrc/constants/storage'
import { localStorageService } from 'uiSrc/services'

import { CreateIndexOnboardingStep } from '../../components/create-index-onboarding/CreateIndexOnboarding.constants'
import { CreateIndexOnboardingProvider } from './CreateIndexOnboardingProvider'
import { useCreateIndexOnboarding } from './CreateIndexOnboardingContext'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  localStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
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

describe('CreateIndexOnboardingProvider', () => {
  const renderComponent = () =>
    render(
      <CreateIndexOnboardingProvider>
        <TestConsumer />
      </CreateIndexOnboardingProvider>,
    )

  beforeEach(() => {
    jest.clearAllMocks()
    ;(localStorageService.get as jest.Mock).mockReturnValue(null)
  })

  it('should start inactive with no current step', () => {
    renderComponent()

    expect(screen.getByTestId('current-step')).toHaveTextContent('null')
    expect(screen.getByTestId('is-active')).toHaveTextContent('false')
  })

  it('should start onboarding at DefineIndex step', () => {
    renderComponent()

    fireEvent.click(screen.getByTestId('start'))

    expect(screen.getByTestId('current-step')).toHaveTextContent(
      CreateIndexOnboardingStep.DefineIndex,
    )
    expect(screen.getByTestId('is-active')).toHaveTextContent('true')
  })

  it('should not start onboarding if already seen', () => {
    ;(localStorageService.get as jest.Mock).mockReturnValue(true)

    renderComponent()

    fireEvent.click(screen.getByTestId('start'))

    expect(screen.getByTestId('current-step')).toHaveTextContent('null')
    expect(screen.getByTestId('is-active')).toHaveTextContent('false')
  })

  it('should not start onboarding twice', () => {
    renderComponent()

    fireEvent.click(screen.getByTestId('start'))
    fireEvent.click(screen.getByTestId('start'))

    expect(screen.getByTestId('current-step')).toHaveTextContent(
      CreateIndexOnboardingStep.DefineIndex,
    )
  })

  it('should advance through steps with nextStep', () => {
    renderComponent()

    fireEvent.click(screen.getByTestId('start'))
    expect(screen.getByTestId('current-step')).toHaveTextContent(
      CreateIndexOnboardingStep.DefineIndex,
    )

    fireEvent.click(screen.getByTestId('next'))
    expect(screen.getByTestId('current-step')).toHaveTextContent(
      CreateIndexOnboardingStep.IndexPrefix,
    )

    fireEvent.click(screen.getByTestId('next'))
    expect(screen.getByTestId('current-step')).toHaveTextContent(
      CreateIndexOnboardingStep.FieldName,
    )
  })

  it('should complete and persist after last step', () => {
    renderComponent()

    fireEvent.click(screen.getByTestId('start'))

    for (let i = 0; i < 6; i++) {
      fireEvent.click(screen.getByTestId('next'))
    }

    expect(localStorageService.set).toHaveBeenCalledWith(
      BrowserStorageItem.vectorSearchCreateIndexOnboarding,
      true,
    )
    expect(screen.getByTestId('is-active')).toHaveTextContent('false')
  })

  it('should skip and persist on skipOnboarding', () => {
    renderComponent()

    fireEvent.click(screen.getByTestId('start'))
    fireEvent.click(screen.getByTestId('skip'))

    expect(localStorageService.set).toHaveBeenCalledWith(
      BrowserStorageItem.vectorSearchCreateIndexOnboarding,
      true,
    )
    expect(screen.getByTestId('is-active')).toHaveTextContent('false')
  })

  it('should go back to previous step with prevStep', () => {
    renderComponent()

    fireEvent.click(screen.getByTestId('start'))
    fireEvent.click(screen.getByTestId('next'))
    expect(screen.getByTestId('current-step')).toHaveTextContent(
      CreateIndexOnboardingStep.IndexPrefix,
    )

    fireEvent.click(screen.getByTestId('prev'))
    expect(screen.getByTestId('current-step')).toHaveTextContent(
      CreateIndexOnboardingStep.DefineIndex,
    )
  })

  it('should stay on first step when prevStep is called', () => {
    renderComponent()

    fireEvent.click(screen.getByTestId('start'))
    expect(screen.getByTestId('current-step')).toHaveTextContent(
      CreateIndexOnboardingStep.DefineIndex,
    )

    fireEvent.click(screen.getByTestId('prev'))
    expect(screen.getByTestId('current-step')).toHaveTextContent(
      CreateIndexOnboardingStep.DefineIndex,
    )
  })

  describe('edge cases', () => {
    it('should no-op nextStep when not active', () => {
      renderComponent()

      fireEvent.click(screen.getByTestId('next'))

      expect(screen.getByTestId('is-active')).toHaveTextContent('false')
      expect(localStorageService.set).not.toHaveBeenCalled()
    })

    it('should no-op prevStep when not active', () => {
      renderComponent()

      fireEvent.click(screen.getByTestId('prev'))

      expect(screen.getByTestId('is-active')).toHaveTextContent('false')
    })

    it('should no-op skipOnboarding when not active', () => {
      renderComponent()

      fireEvent.click(screen.getByTestId('skip'))

      expect(screen.getByTestId('is-active')).toHaveTextContent('false')
      expect(localStorageService.set).not.toHaveBeenCalled()
    })
  })
})
