import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { buildDatabaseAnalysisWithNamespaces } from 'uiSrc/mocks/factories/database-analysis/DatabaseAnalysis.factory'

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
    data: buildDatabaseAnalysisWithNamespaces(),
    extrapolation: 50,
  },
}
