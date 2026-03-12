import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { MakeSearchableModal } from './MakeSearchableModal'

const meta: Meta<typeof MakeSearchableModal> = {
  component: MakeSearchableModal,
  tags: ['autodocs'],
  args: {
    onConfirm: fn(),
    onCancel: fn(),
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    isOpen: true,
    prefix: 'bicycle:',
  },
}

export const WithoutPrefix: Story = {
  args: {
    isOpen: true,
  },
}
