import React from 'react'
import {
  StyledAppNavigation,
  StyledAppNavigationContainer,
} from './AppNavigation.styles'

const AppNavigationContainer = ({
  children,
}: {
  children?: React.ReactNode
}) => (
  <StyledAppNavigationContainer gap="m" align="center">
    {children}
  </StyledAppNavigationContainer>
)

const AppNavigation = ({}) => (
  <StyledAppNavigation gap="m" align="center">
    <AppNavigationContainer />
    <AppNavigationContainer>tabs here</AppNavigationContainer>
    <AppNavigationContainer />
  </StyledAppNavigation>
)

export default AppNavigation
