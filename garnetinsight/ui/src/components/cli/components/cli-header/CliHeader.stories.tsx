import type { Meta, StoryObj } from '@storybook/react-vite'

import CliHeader from './CliHeader'

const cliHeaderMeta = {
  component: CliHeader,
} satisfies Meta<typeof CliHeader>

export default cliHeaderMeta

type Story = StoryObj<typeof cliHeaderMeta>

export const Default: Story = {}
