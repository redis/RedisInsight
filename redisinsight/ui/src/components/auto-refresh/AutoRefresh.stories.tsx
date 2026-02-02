import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'
import {
  DATABASE_OVERVIEW_MINIMUM_REFRESH_INTERVAL,
  DATABASE_OVERVIEW_REFRESH_INTERVAL,
} from 'uiSrc/constants'
import AutoRefresh from './index'

const meta = {
  component: AutoRefresh,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => {
      return (
        <div style={{ width: '300px' }}>
          <Story />
        </div>
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
