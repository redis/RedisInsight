import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import * as featureSlice from 'uiSrc/slices/app/features'
import OnboardingTourWrapper from './OnboardingTourWrapper'

const mockedOptions = {
  step: 2,
  title: 'Title',
  Inner: () => ({
    content: 'Content',
  }),
}

jest.spyOn(featureSlice, 'appFeatureOnboardingSelector').mockReturnValue({
  currentStep: 2,
  isActive: true,
  totalSteps: 10,
})

describe('OnboardingTourWrapper', () => {
  it('should render', () => {
    expect(
      render(
        <OnboardingTourWrapper options={mockedOptions}>
          <span />
        </OnboardingTourWrapper>,
      ),
    ).toBeTruthy()
  })

  it('should render tour', () => {
    render(
      <OnboardingTourWrapper options={mockedOptions}>
        <span />
      </OnboardingTourWrapper>,
    )

    expect(screen.getByTestId('onboarding-tour')).toBeInTheDocument()
  })

  it('should not render tour with isActive = false', () => {
    ;(featureSlice.appFeatureOnboardingSelector as jest.Mock).mockReturnValue({
      currentStep: 2,
      isActive: false,
      totalSteps: 10,
    })
    render(
      <OnboardingTourWrapper options={mockedOptions}>
        <span data-testid="span" />
      </OnboardingTourWrapper>,
    )

    expect(screen.queryByTestId('onboarding-tour')).not.toBeInTheDocument()
    expect(screen.getByTestId('span')).toBeInTheDocument()
  })

  it('should not render tour with isActive = true & different step', () => {
    ;(featureSlice.appFeatureOnboardingSelector as jest.Mock).mockReturnValue({
      currentStep: 3,
      isActive: true,
      totalSteps: 10,
    })
    render(
      <OnboardingTourWrapper options={mockedOptions}>
        <span data-testid="span" />
      </OnboardingTourWrapper>,
    )

    expect(screen.queryByTestId('onboarding-tour')).not.toBeInTheDocument()
    expect(screen.getByTestId('span')).toBeInTheDocument()
  })
})
