import type { Meta, StoryObj } from '@storybook/react-vite'

import SettingsPage from './SettingsPage'

const meta: Meta<typeof SettingsPage> = {
  component: SettingsPage,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
