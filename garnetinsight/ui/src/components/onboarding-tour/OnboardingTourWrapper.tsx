import { useSelector } from 'react-redux'
import React, { useEffect, useState } from 'react'
import { PopoverAnchorPosition } from '@elastic/eui/src/components/popover/popover'
import { appFeatureOnboardingSelector } from 'uiSrc/slices/app/features'

import OnboardingTour from './OnboardingTour'
import { OnboardingTourOptions } from './interfaces'

export interface Props {
  options: OnboardingTourOptions
  children: React.ReactElement
  anchorPosition?: PopoverAnchorPosition
  panelClassName?: string
  anchorWrapperClassName?: string
  preventPropagation?: boolean
  fullSize?: boolean
  delay?: number
  rerenderWithDelay?: any
}

const OnboardingTourWrapper = (props: Props) => {
  const { options, children, delay, rerenderWithDelay } = props
  const { step } = options
  const { currentStep, isActive, totalSteps } = useSelector(
    appFeatureOnboardingSelector,
  )
  const [isDelayed, setIsDelayed] = useState(true)

  const isCurrentStep = step === currentStep && isActive

  useEffect(() => {
    if (!isCurrentStep) return setIsDelayed(true)
    if (!delay) return setIsDelayed(false)

    setIsDelayed(true)
    const timeId = setTimeout(() => setIsDelayed(false), delay)

    return () => clearTimeout(timeId)
  }, [isCurrentStep, delay, rerenderWithDelay])

  // render tour only when it needed due to side effect calls
  return !isDelayed && isCurrentStep ? (
    <OnboardingTour
      currentStep={currentStep}
      totalSteps={totalSteps}
      isActive={isActive}
      {...props}
    >
      {children}
    </OnboardingTour>
  ) : (
    children
  )
}

export default OnboardingTourWrapper
