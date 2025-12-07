import React from 'react'
import { cloneDeep } from 'lodash'
import {
  render,
  screen,
  fireEvent,
  mockedStore,
  cleanup,
} from 'uiSrc/utils/test-utils'

import {
  setOnboardNextStep,
  setOnboardPrevStep,
  skipOnboarding,
} from 'uiSrc/slices/app/features'
import OnboardingTour from './OnboardingTour'

const mockedOptions = {
  step: 2,
  title: 'Title',
  Inner: () => ({
    content: 'Content',
  }),
}

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('OnboardingTour', () => {
  it('should render', () => {
    expect(
      render(
        <OnboardingTour
          options={mockedOptions}
          currentStep={2}
          totalSteps={3}
          isActive
        >
          <span />
        </OnboardingTour>,
      ),
    ).toBeTruthy()
  })

  it('should render title, content, skip, next, back buttons', () => {
    render(
      <OnboardingTour
        options={mockedOptions}
        currentStep={2}
        totalSteps={3}
        isActive
      >
        <span />
      </OnboardingTour>,
    )

    expect(screen.getByTestId('step-title')).toHaveTextContent('Title')
    expect(screen.getByTestId('step-content')).toHaveTextContent('Content')
    expect(screen.getByTestId('skip-tour-btn')).toBeInTheDocument()
    expect(screen.getByTestId('back-btn')).toBeInTheDocument()
    expect(screen.getByTestId('next-btn')).toBeInTheDocument()
  })

  it('should not render back button for first step', () => {
    render(
      <OnboardingTour
        options={{
          ...mockedOptions,
          step: 1,
        }}
        currentStep={1}
        totalSteps={3}
        isActive
      >
        <span />
      </OnboardingTour>,
    )

    expect(screen.queryByTestId('back-btn')).not.toBeInTheDocument()
  })

  it('should call proper actions on back button', () => {
    const onBack = jest.fn()

    render(
      <OnboardingTour
        options={{
          ...mockedOptions,
          Inner: () => ({
            content: '',
            onBack,
          }),
        }}
        currentStep={2}
        totalSteps={3}
        isActive
        preventPropagation
      >
        <span />
      </OnboardingTour>,
    )

    fireEvent.click(screen.getByTestId('back-btn'))
    expect(store.getActions()).toEqual([setOnboardPrevStep()])
    expect(onBack).toHaveBeenCalled()
  })

  it('should call proper actions on next button', () => {
    const onNext = jest.fn()

    render(
      <OnboardingTour
        options={{
          ...mockedOptions,
          Inner: () => ({
            content: '',
            onNext,
          }),
        }}
        currentStep={2}
        totalSteps={3}
        isActive
      >
        <span />
      </OnboardingTour>,
    )

    fireEvent.click(screen.getByTestId('next-btn'))
    expect(store.getActions()).toEqual([setOnboardNextStep()])
    expect(onNext).toHaveBeenCalled()
  })

  it('should call proper actions on skip button', () => {
    const onSkip = jest.fn()

    render(
      <OnboardingTour
        options={{
          ...mockedOptions,
          Inner: () => ({
            content: '',
            onSkip,
          }),
        }}
        currentStep={2}
        totalSteps={3}
        isActive
      >
        <span />
      </OnboardingTour>,
    )

    fireEvent.click(screen.getByTestId('skip-tour-btn'))
    expect(store.getActions()).toEqual([skipOnboarding()])
    expect(onSkip).toHaveBeenCalled()
  })

  it('should not show onboarding if step !== currentStep', () => {
    render(
      <OnboardingTour
        options={mockedOptions}
        currentStep={1}
        totalSteps={3}
        isActive
      >
        <span />
      </OnboardingTour>,
    )

    expect(screen.queryByTestId('step-title')).not.toBeInTheDocument()
  })

  it('should not show onboarding if isActive = false', () => {
    render(
      <OnboardingTour
        options={mockedOptions}
        currentStep={2}
        totalSteps={3}
        isActive={false}
      >
        <span />
      </OnboardingTour>,
    )

    expect(screen.queryByTestId('step-title')).not.toBeInTheDocument()
  })
})
