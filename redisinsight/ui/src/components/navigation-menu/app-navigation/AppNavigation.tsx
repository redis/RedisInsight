import React, { ReactNode } from 'react'
import { RiTabs, TabInfo, RiRow } from 'uiSrc/components/base/layout'
import {
  StyledAppNavigation,
  StyledAppNavigationContainer,
  StyledAppNavTab,
} from './AppNavigation.styles'
import { useNavigation } from '../hooks/useNavigation'

type AppNavigationContainerProps = {
  children?: ReactNode
  borderLess?: boolean
} & Pick<
  React.ComponentProps<typeof RiRow>,
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
  const navTabs: TabInfo[] = privateRoutes.map((route) => ({
    label: route.tooltipText,
    content: '',
    value: route.pageName,
  }))

  return (
    <StyledAppNavigation>
      <AppNavigationContainer />
      <AppNavigationContainer borderLess grow={false}>
        <RiRow align="end">
          <RiTabs.Compose
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
            <RiTabs.TabBar.Compose variant="default">
              {navTabs.map(({ value, label, disabled }, index) => {
                const key = `${value}-${index}`
                return (
                  <RiTabs.TabBar.Trigger.Compose
                    value={value}
                    disabled={disabled}
                    key={key}
                  >
                    <StyledAppNavTab>{label ?? value}</StyledAppNavTab>
                    <RiTabs.TabBar.Trigger.Marker />
                  </RiTabs.TabBar.Trigger.Compose>
                )
              })}
            </RiTabs.TabBar.Compose>
          </RiTabs.Compose>
        </RiRow>
      </AppNavigationContainer>
      <AppNavigationContainer justify="end" align="center">
        {actions}
      </AppNavigationContainer>
    </StyledAppNavigation>
  )
}

export default AppNavigation
