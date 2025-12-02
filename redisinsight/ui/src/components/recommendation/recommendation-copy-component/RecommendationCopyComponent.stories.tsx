import type { Meta, StoryObj } from '@storybook/react-vite'

import RecommendationCopyComponent from "./index"

const meta: Meta<typeof RecommendationCopyComponent> = {
  component: RecommendationCopyComponent,
  args: {
    keyName: 'sample_key_name',
    telemetryEvent: 'sample_recommendation',
    live: false,
    provider: 'sample_provider',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
