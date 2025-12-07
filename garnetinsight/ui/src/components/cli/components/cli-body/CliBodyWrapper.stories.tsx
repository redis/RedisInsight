import type { Meta, StoryObj } from '@storybook/react-vite'

import CliBodyWrapper from './CliBodyWrapper'

const cliBodyWrapperMeta = {
  component: CliBodyWrapper,
} satisfies Meta<typeof CliBodyWrapper>

export default cliBodyWrapperMeta

type Story = StoryObj<typeof cliBodyWrapperMeta>

export const Default: Story = {}
