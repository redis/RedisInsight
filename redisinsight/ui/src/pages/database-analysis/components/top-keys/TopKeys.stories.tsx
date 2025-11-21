import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DatabaseAnalysisFactory } from 'uiSrc/mocks/factories/database-analysis/DatabaseAnalysis.factory'

import TopKeys from './TopKeys'

const meta: Meta<typeof TopKeys> = {
  component: TopKeys,
  args: {
    data: null,
    loading: false,
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px', border: '1px solid #ccc' }}>
        <h1>Top Keys</h1>
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof meta>

export const Loading: Story = {
  args: {
    loading: true,
  },
  decorators: [
    (Story) => (
      <div>
        <h2>Loading</h2>
        <p>Component shows loader while fetching keys data</p>
        <Story />
      </div>
    ),
  ],
}

export const NoKeys: Story = {
  args: {
    loading: false,
    data: DatabaseAnalysisFactory.build({
      topKeysMemory: [],
      topKeysLength: [],
    }),
  },
  decorators: [
    (Story) => (
      <div>
        <h2>No Keys</h2>
        <p>Component returns null when no top keys data is available</p>
        <Story />
      </div>
    ),
  ],
}

export const WithData: Story = {
  args: {
    loading: false,
    data: DatabaseAnalysisFactory.build({
      topKeysMemory: [
        {
          name: 'user:sessions',
          type: 'hash',
          memory: 1_000_000,
          length: 5000,
          ttl: -1,
        },
        {
          name: 'orders:recent',
          type: 'list',
          memory: 500_000,
          length: 2000,
          ttl: 3600,
        },
        {
          name: 'metrics:pageviews',
          type: 'zset',
          memory: 250_000,
          length: 1000,
          ttl: -1,
        },
      ],
      topKeysLength: [
        {
          name: 'users:all',
          type: 'set',
          memory: 400_000,
          length: 10000,
          ttl: -1,
        },
        {
          name: 'logs:errors',
          type: 'list',
          memory: 150_000,
          length: 5000,
          ttl: 7200,
        },
        {
          name: 'cache:products',
          type: 'hash',
          memory: 80_000,
          length: 2500,
          ttl: 86400,
        },
      ],
      delimiter: ':',
    }),
  },
  decorators: [
    (Story) => (
      <div>
        <h2>With Data - Memory View</h2>
        <p>Component shows keys sorted by memory consumption (default view)</p>
        <Story />
      </div>
    ),
  ],
}
