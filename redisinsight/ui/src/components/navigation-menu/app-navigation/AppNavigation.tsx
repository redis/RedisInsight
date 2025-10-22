import React, { ReactNode } from 'react'
import Tabs, { TabInfo } from 'uiSrc/components/base/layout/tabs'
import { Row } from 'uiSrc/components/base/layout/flex'
import {
  StyledAppNavigation,
  StyledAppNavigationContainer,
} from './AppNavigation.styles'
import { useNavigation } from '../hooks/useNavigation'
import FeatureFlagComponent from 'uiSrc/components/feature-flag-component/FeatureFlagComponent'
import { FeatureFlags } from 'uiSrc/constants'
import { OnboardingTourOptions } from 'uiSrc/components/onboarding-tour'
import NavigationTabTrigger from './AppNavigationTabTrigger'

type AppNavigationContainerProps = {
  children?: ReactNode
  borderLess?: boolean
} & Pick<
  React.ComponentProps<typeof Row>,
  'gap' | 'justify' | 'align' | 'grow' | 'style'
>
const AppNavigationContainer = ({
  children,
  borderLess,
  gap = 'm',
  justify,
  align,
  grow,
  style,
}: AppNavigationContainerProps) => (
  <StyledAppNavigationContainer
    grow={grow}
    gap={gap}
    justify={justify}
    align={align}
    $borderLess={borderLess}
    full
    style={style}
  >
    {children}
  </StyledAppNavigationContainer>
)

export type AppNavigationProps = {
  actions?: ReactNode
  onChange?: (tabValue: string) => void
}

const AppNavigation = ({ actions, onChange }: AppNavigationProps) => {
  const { privateRoutes } = useNavigation()
  const activeTab = privateRoutes.find((route) => route.isActivePage)
  const navTabs: (TabInfo & {
    isActivePage: boolean
    featureFlag?: FeatureFlags
    onboard?: OnboardingTourOptions
  })[] = privateRoutes.map((route) => ({
    label: route.tooltipText,
    content: '',
    value: route.pageName,
    isActivePage: route.isActivePage,
    featureFlag: route.featureFlag,
    onboard: route.onboard,
  }))

  return (
    <StyledAppNavigation>
      <AppNavigationContainer />
      <AppNavigationContainer
        borderLess
        grow={false}
        justify="center"
        align="end"
      >
        <Tabs.Compose
          value={activeTab?.pageName}
          onChange={(tabValue) => {
            const tabNavItem = privateRoutes.find(
              (route) => route.pageName === tabValue,
            )
            if (tabNavItem) {
              onChange?.(tabNavItem.pageName) // remove actions before navigation, displayed page, should set their own actions
              tabNavItem.onClick()
            }
          }}
        >
          <Tabs.TabBar.Compose variant="default">
            {navTabs.map(
              (
                { value, label, disabled, featureFlag, onboard, isActivePage },
                index,
              ) => {
                const key = `${value}-${index}`
                if (featureFlag) {
                  return (
                    <FeatureFlagComponent
                      name={featureFlag as FeatureFlags}
                      key={key}
                    >
                      <NavigationTabTrigger
                        value={value}
                        label={label}
                        disabled={disabled}
                        onboard={onboard}
                        isActivePage={isActivePage}
                        tabKey={key}
                      />
                    </FeatureFlagComponent>
                  )
                }

                return (
                  <NavigationTabTrigger
                    value={value}
                    label={label}
                    disabled={disabled}
                    onboard={onboard}
                    isActivePage={isActivePage}
                    tabKey={key}
                  />
                )
              },
            )}
          </Tabs.TabBar.Compose>
        </Tabs.Compose>
      </AppNavigationContainer>
      <AppNavigationContainer justify="end" align="center">
        {actions}
      </AppNavigationContainer>
    </StyledAppNavigation>
  )
}

export default AppNavigation
