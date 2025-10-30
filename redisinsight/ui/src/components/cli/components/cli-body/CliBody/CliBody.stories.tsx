import type { Meta, StoryObj } from '@storybook/react-vite'

import CliBody from './CliBody'

const cliBodyMeta = {
  component: CliBody,
} satisfies Meta<typeof CliBody>

export default cliBodyMeta

type Story = StoryObj<typeof cliBodyMeta>

export const Default: Story = {
  args: {
    data: [],
    command: '',
    error: '',
    setCommand: () => {},
    onSubmit: () => {},
  },
}

export const WithInput: Story = {
  args: {
    data: ['test\n', 'test2\n', 'test3\n'],
    command: 'INFO',
    error: '',
    setCommand: () => {},
    onSubmit: () => {},
  },
}
