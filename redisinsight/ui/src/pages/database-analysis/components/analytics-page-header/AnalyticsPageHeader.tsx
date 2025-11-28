import React from 'react'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import AnalyticsTabs from 'uiSrc/components/analytics-tabs'
import { AnalyticsPageHeaderProps } from './AnalyticsPageHeader.types'
import {
  HeaderContainer,
  HeaderContent,
  TabsWrapper,
} from './AnalyticsPageHeader.styles'

export const AnalyticsPageHeader = ({ actions }: AnalyticsPageHeaderProps) => (
  <HeaderContainer>
    <HeaderContent>
      <FlexItem>
        <TabsWrapper>
          <AnalyticsTabs />
        </TabsWrapper>
      </FlexItem>
      {actions && <FlexItem>{actions}</FlexItem>}
    </HeaderContent>
  </HeaderContainer>
)
