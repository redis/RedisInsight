import type { Meta, StoryObj } from '@storybook/react-vite'

import AnalyticsTabs from './index'

const meta = {
  component: AnalyticsTabs,
} satisfies Meta<typeof AnalyticsTabs>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
