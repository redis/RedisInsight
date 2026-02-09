import type { Meta, StoryObj } from '@storybook/react-vite'
import { RqeNotAvailable } from './RqeNotAvailable'

const meta: Meta<typeof RqeNotAvailable> = {
  component: RqeNotAvailable,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof RqeNotAvailable>

export const Default: Story = {}
