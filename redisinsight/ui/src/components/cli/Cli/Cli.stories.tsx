import type { Meta, StoryObj } from '@storybook/react-vite'

import Cli from './Cli'

const cliMeta = {
  component: Cli,
} satisfies Meta<typeof Cli>

export default cliMeta

type Story = StoryObj<typeof cliMeta>

export const Default: Story = {}
