import type { Meta, StoryObj } from '@storybook/react-vite'

import BottomGroupMinimized from './BottomGroupMinimized'

const meta = {
  component: BottomGroupMinimized,
} satisfies Meta<typeof BottomGroupMinimized>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
