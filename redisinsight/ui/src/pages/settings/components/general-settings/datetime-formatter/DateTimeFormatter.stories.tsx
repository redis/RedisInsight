import type { Meta, StoryObj } from '@storybook/react-vite'

import DateTimeFormatter from './DateTimeFormatter'

const meta: Meta<typeof DateTimeFormatter> = {
  component: DateTimeFormatter,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
