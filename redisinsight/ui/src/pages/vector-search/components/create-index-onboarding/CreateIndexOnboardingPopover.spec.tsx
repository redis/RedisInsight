import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import {
  CreateIndexOnboardingStep,
  TOTAL_STEPS,
} from './CreateIndexOnboarding.constants'
import {
  CreateIndexOnboardingContext,
  CreateIndexOnboardingContextValue,
} from '../../context/create-index-onboarding'
import { CreateIndexOnboardingPopover } from './CreateIndexOnboardingPopover'

const mockNextStep = jest.fn()
const mockPrevStep = jest.fn()
const mockSkipOnboarding = jest.fn()

const defaultContextValue: CreateIndexOnboardingContextValue = {
  currentStep: null,
  isActive: false,
  totalSteps: TOTAL_STEPS,
  startOnboarding: jest.fn(),
  nextStep: mockNextStep,
  prevStep: mockPrevStep,
  skipOnboarding: mockSkipOnboarding,
}

describe('CreateIndexOnboardingPopover', () => {
  const renderComponent = (
    step: CreateIndexOnboardingStep,
    contextOverrides?: Partial<CreateIndexOnboardingContextValue>,
  ) => {
    const value = { ...defaultContextValue, ...contextOverrides }
    return render(
      <CreateIndexOnboardingContext.Provider value={value}>
        <CreateIndexOnboardingPopover step={step}>
          <button type="button" data-testid="trigger">
            Trigger
          </button>
        </CreateIndexOnboardingPopover>
      </CreateIndexOnboardingContext.Provider>,
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render only children when onboarding is not active', () => {
    renderComponent(CreateIndexOnboardingStep.DefineIndex)

    expect(screen.getByTestId('trigger')).toBeInTheDocument()
    expect(
      screen.queryByTestId(
        `create-index-onboarding-content-${CreateIndexOnboardingStep.DefineIndex}`,
      ),
    ).not.toBeInTheDocument()
  })

  it('should show title, step counter, Next, Skip tour, and no Back on first step', () => {
    renderComponent(CreateIndexOnboardingStep.DefineIndex, {
      isActive: true,
      currentStep: CreateIndexOnboardingStep.DefineIndex,
    })

    expect(
      screen.getByText('Review and adjust the indexing schema'),
    ).toBeInTheDocument()
    expect(screen.getByText(`1/${TOTAL_STEPS}`)).toBeInTheDocument()

    expect(
      screen.queryByTestId('create-index-onboarding-back'),
    ).not.toBeInTheDocument()

    const nextButton = screen.getByTestId(
      `create-index-onboarding-action-${CreateIndexOnboardingStep.DefineIndex}`,
    )
    expect(nextButton).toHaveTextContent('Next')
    fireEvent.click(nextButton)
    expect(mockNextStep).toHaveBeenCalledTimes(1)

    expect(
      screen.getByTestId('create-index-onboarding-skip'),
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('create-index-onboarding-close'),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('create-index-onboarding-skip'))
    expect(mockSkipOnboarding).toHaveBeenCalledTimes(1)
  })

  it('should show Back button and step counter on intermediate step', () => {
    renderComponent(CreateIndexOnboardingStep.IndexPrefix, {
      isActive: true,
      currentStep: CreateIndexOnboardingStep.IndexPrefix,
    })

    expect(screen.getByText(`2/${TOTAL_STEPS}`)).toBeInTheDocument()

    const backButton = screen.getByTestId('create-index-onboarding-back')
    expect(backButton).toHaveTextContent('Back')
    fireEvent.click(backButton)
    expect(mockPrevStep).toHaveBeenCalledTimes(1)
  })

  it('should show Got it, close button, Back, and no Skip tour on last step', () => {
    renderComponent(CreateIndexOnboardingStep.CommandView, {
      isActive: true,
      currentStep: CreateIndexOnboardingStep.CommandView,
    })

    const gotItButton = screen.getByTestId(
      `create-index-onboarding-action-${CreateIndexOnboardingStep.CommandView}`,
    )
    expect(gotItButton).toHaveTextContent('Got it')
    fireEvent.click(gotItButton)
    expect(mockSkipOnboarding).toHaveBeenCalledTimes(1)

    expect(
      screen.getByTestId('create-index-onboarding-close'),
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('create-index-onboarding-skip'),
    ).not.toBeInTheDocument()

    expect(
      screen.getByTestId('create-index-onboarding-back'),
    ).toBeInTheDocument()
  })

  it('should render indexing type content for IndexingType step', () => {
    renderComponent(CreateIndexOnboardingStep.IndexingType, {
      isActive: true,
      currentStep: CreateIndexOnboardingStep.IndexingType,
    })

    expect(
      screen.getByTestId('create-index-onboarding-indexing-types'),
    ).toBeInTheDocument()
    expect(screen.getByText('TEXT')).toBeInTheDocument()
    expect(screen.getByText('VECTOR')).toBeInTheDocument()
  })
})
