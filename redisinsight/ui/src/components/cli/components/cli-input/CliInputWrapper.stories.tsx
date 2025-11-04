import type { Meta, StoryObj } from '@storybook/react-vite'

import CliInputWrapper from './CliInputWrapper'

const cliInputWrapperMeta = {
  component: CliInputWrapper,
  args: {
    command: 'SCAN',
    wordsTyped: 1,
    setInputEl: () => {},
    setCommand: () => {},
    onKeyDown: () => {},
  },
} satisfies Meta<typeof CliInputWrapper>

export default cliInputWrapperMeta

type Story = StoryObj<typeof cliInputWrapperMeta>

export const Default: Story = {}
