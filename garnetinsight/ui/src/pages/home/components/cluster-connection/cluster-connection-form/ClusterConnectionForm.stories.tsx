import type { Meta, StoryObj } from '@storybook/react-vite'

import ClusterConnectionForm from './'

const meta: Meta<typeof ClusterConnectionForm> = {
  component: ClusterConnectionForm,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
