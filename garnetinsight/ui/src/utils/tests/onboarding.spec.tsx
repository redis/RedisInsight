import React from 'react'
import { renderOnboardingTourWithChild } from 'uiSrc/utils/onboarding'
import { render, screen } from 'uiSrc/utils/test-utils'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureOnboardingSelector: jest.fn().mockReturnValue({
    currentStep: 1,
    isActive: true,
    totalSteps: 10,
  }),
}))

describe('renderOnboardingTourWithChild', () => {
  it('should render child into tour', () => {
    render(
      <div>
        {renderOnboardingTourWithChild(
          <span data-testid="span" />,
          {
            options: ONBOARDING_FEATURES.BROWSER_PAGE,
            anchorPosition: 'downLeft',
          },
          true,
        )}
      </div>,
    )

    expect(screen.getByTestId('span')).toBeInTheDocument()
    expect(screen.getByTestId('onboarding-tour')).toBeInTheDocument()
  })

  it('should render child without tour', () => {
    render(
      <div>
        {renderOnboardingTourWithChild(
          <span data-testid="span" />,
          {
            options: ONBOARDING_FEATURES.BROWSER_PAGE,
            anchorPosition: 'downLeft',
          },
          false,
        )}
      </div>,
    )

    expect(screen.getByTestId('span')).toBeInTheDocument()
    expect(screen.queryByTestId('onboarding-tour')).not.toBeInTheDocument()
  })
})
