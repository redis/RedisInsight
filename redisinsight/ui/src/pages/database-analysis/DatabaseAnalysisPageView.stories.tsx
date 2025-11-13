import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { DatabaseAnalysisPageView } from './DatabaseAnalysisPageView'

const meta: Meta<typeof DatabaseAnalysisPageView> = {
  component: DatabaseAnalysisPageView,
  args: {
    reports: [],
    selectedAnalysis: null,
    analysisLoading: false,
    data: null,
    handleSelectAnalysis: fn(),
  },
  decorators: [
    (Story) => (
      <div
        className="_main_foy9d_2"
        style={{ flexGrow: 1, background: 'pink' }}
      >
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
