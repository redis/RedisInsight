import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DatabaseAnalysisFactory } from 'uiSrc/mocks/factories/database-analysis/DatabaseAnalysis.factory'

import TopNamespace from './TopNamespace'
import { DEFAULT_EXTRAPOLATION } from '../../constants'

const meta: Meta<typeof TopNamespace> = {
  component: TopNamespace,
  args: {
    data: null,
    loading: false,
    extrapolation: DEFAULT_EXTRAPOLATION,
    onSwitchExtrapolation: () => undefined,
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px 100px', border: '1px solid #ccc' }}>
        <h1>Top Namespace</h1>
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
}

export const Default: Story = {
  args: {
    loading: false,
    data: DatabaseAnalysisFactory.build({
      ...{
        topMemoryNsp: [
          {
            nsp: 'users',
            memory: 500000,
            keys: 1200,
            types: [
              {
                type: 'hash',
                memory: 400000,
                keys: 800,
              },
              {
                type: 'string',
                memory: 100000,
                keys: 400,
              },
            ],
          },
          {
            nsp: 'orders',
            memory: 300000,
            keys: 600,
            types: [
              {
                type: 'zset',
                memory: 200000,
                keys: 300,
              },
              {
                type: 'list',
                memory: 100000,
                keys: 300,
              },
            ],
          },
        ],
        topKeysNsp: [
          {
            nsp: 'users',
            memory: 500000,
            keys: 1200,
            types: [
              {
                type: 'hash',
                memory: 400000,
                keys: 800,
              },
              {
                type: 'string',
                memory: 100000,
                keys: 400,
              },
            ],
          },
          {
            nsp: 'orders',
            memory: 300000,
            keys: 600,
            types: [
              {
                type: 'zset',
                memory: 200000,
                keys: 300,
              },
              {
                type: 'list',
                memory: 100000,
                keys: 300,
              },
            ],
          },
        ],
      },
      delimiter: ':',
    }),
    extrapolation: 50,
  },
}
