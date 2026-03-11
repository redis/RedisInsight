import type { Meta, StoryObj } from '@storybook/react-vite'

import { MakeSearchableModal } from './MakeSearchableModal'

const meta: Meta<typeof MakeSearchableModal> = {
  component: MakeSearchableModal,
  tags: ['autodocs'],
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
