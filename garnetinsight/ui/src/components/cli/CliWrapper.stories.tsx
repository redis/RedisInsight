import type { Meta, StoryObj } from '@storybook/react-vite'

import CliWrapper from './CliWrapper'

const cliWrapperMeta = {
  component: CliWrapper,
} satisfies Meta<typeof CliWrapper>

export default cliWrapperMeta

type Story = StoryObj<typeof cliWrapperMeta>

export const Default: Story = {}
