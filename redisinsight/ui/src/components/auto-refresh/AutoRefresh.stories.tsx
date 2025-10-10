import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'
import AutoRefresh from './index'
import {
  DATABASE_OVERVIEW_MINIMUM_REFRESH_INTERVAL,
  DATABASE_OVERVIEW_REFRESH_INTERVAL,
} from 'uiSrc/constants'
import styled from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'
const StyledContainer = styled.div`
  padding: 50px;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral100};
  border: 2px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral500};
`
const meta = {
  component: AutoRefresh,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => {
      return (
        <StyledContainer>
          <Story />
        </StyledContainer>
      )
    },
  ],
} satisfies Meta<typeof AutoRefresh>

export default meta

type Story = StoryObj<typeof meta>

export const AutoRefreshDefault: Story = {
  args: {
    postfix: 'default',
    loading: false,
    onRefresh: () => {},
    onRefreshClicked: () => {},
    onEnableAutoRefresh: () => {},
    enableAutoRefreshDefault: true,
    defaultRefreshRate: DATABASE_OVERVIEW_REFRESH_INTERVAL,
    minimumRefreshRate: parseInt(DATABASE_OVERVIEW_MINIMUM_REFRESH_INTERVAL),
    lastRefreshTime: Date.now(),
  },
}
export const AutoRefreshDatabaseOverview: Story = {
  args: {
    displayText: false,
    displayLastRefresh: false,
    iconSize: 'S',
    loading: false,
    enableAutoRefreshDefault: true,
    lastRefreshTime: 100,
    containerClassName: '',
    postfix: 'overview',
    testid: 'auto-refresh-overview',
    defaultRefreshRate: DATABASE_OVERVIEW_REFRESH_INTERVAL,
    minimumRefreshRate: parseInt(DATABASE_OVERVIEW_MINIMUM_REFRESH_INTERVAL),
    onRefresh: () => {},
    onRefreshClicked: () => {},
    onEnableAutoRefresh: () => {},
  },
}
