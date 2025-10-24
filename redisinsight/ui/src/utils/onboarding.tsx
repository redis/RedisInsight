import React from 'react'
import { PopoverAnchorPosition } from '@elastic/eui'
import { OnboardingTour } from 'uiSrc/components'
import { OnboardingTourOptions } from 'uiSrc/components/onboarding-tour'
import { Props as OnboardingTourProps } from 'uiSrc/components/onboarding-tour/OnboardingTourWrapper'
import { Maybe } from 'uiSrc/utils/types'

interface Props extends Omit<OnboardingTourProps, 'children' | 'options'> {
  options: Maybe<OnboardingTourOptions>
  anchorPosition?: PopoverAnchorPosition
}

const renderOnboardingTourWithChild = (
  children: React.ReactElement,
  props: Props,
  isActive = true,
  key: string,
) =>
  props.options && isActive ? (
    <OnboardingTour
      {...props}
      options={props.options as OnboardingTourOptions}
      key={key}
    >
      {children}
    </OnboardingTour>
  ) : (
    children
  )

export { renderOnboardingTourWithChild }
