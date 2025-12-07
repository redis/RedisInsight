import type { Meta, StoryObj } from '@storybook/react-vite'

import CliInput from './index'

const cliInputMeta = {
  component: CliInput,
  args: {
    command: 'SCAN',
    setInputEl: () => {},
    setCommand: () => {},
    onKeyDown: () => {},
    dbIndex: 0,
  },
} satisfies Meta<typeof CliInput>

export default cliInputMeta

type Story = StoryObj<typeof cliInputMeta>

export const Default: Story = {}
