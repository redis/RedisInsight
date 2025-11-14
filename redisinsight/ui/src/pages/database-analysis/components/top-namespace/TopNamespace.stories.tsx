import type { Meta, StoryObj } from '@storybook/react-vite'

import TopNamespace from './TopNamespace'

const meta: Meta<typeof TopNamespace> = {
  component: TopNamespace,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
