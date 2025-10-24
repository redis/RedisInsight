import React, { ReactNode } from 'react'
import Tabs from 'uiSrc/components/base/layout/tabs'
import { OnboardingTourOptions } from 'uiSrc/components/onboarding-tour'
import { renderOnboardingTourWithChild } from 'uiSrc/utils/onboarding'

interface NavigationTabTriggerProps {
  value: string
  label?: ReactNode | string
  disabled?: boolean
  onboard?: OnboardingTourOptions
  isActivePage: boolean
  tabKey: string
}

const NavigationTabTrigger = ({
  value,
  label,
  disabled,
  onboard,
  isActivePage,
  tabKey,
}: NavigationTabTriggerProps) =>
  renderOnboardingTourWithChild(
    <Tabs.TabBar.Trigger.Compose value={value} disabled={disabled} key={tabKey}>
      <Tabs.TabBar.Trigger.Tab>{label ?? value}</Tabs.TabBar.Trigger.Tab>
      <Tabs.TabBar.Trigger.Marker />
    </Tabs.TabBar.Trigger.Compose>,
    { options: onboard, anchorPosition: 'upCenter' },
    isActivePage,
    `ob-${label}`,
  )

export default NavigationTabTrigger
