import type { Meta, StoryObj } from '@storybook/react-vite'
import { RedisSearchNotAvailable } from './RedisSearchNotAvailable'

const meta: Meta<typeof RedisSearchNotAvailable> = {
  component: RedisSearchNotAvailable,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof RedisSearchNotAvailable>

export const Default: Story = {}
