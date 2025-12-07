import { IconType } from 'uiSrc/components/base/forms/buttons'
import { FeatureFlags } from 'uiSrc/constants'
import { OnboardingTourOptions } from '../onboarding-tour'

export interface INavigations {
  isActivePage: boolean
  isBeta?: boolean
  pageName: string
  tooltipText: string
  ariaLabel: string
  dataTestId: string
  connectedInstanceId?: string
  onClick: () => void
  iconType: IconType
  onboard?: OnboardingTourOptions
  featureFlag?: FeatureFlags
}
