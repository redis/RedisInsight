import type { Meta, StoryObj } from '@storybook/react-vite'

import BarChart from './BarChart'

const barCharMeta = {
  component: BarChart,
  args: {
    width: 600,
    height: 200,
    name: 'test',
    data: [
      { x: 1, y: 0, xlabel: 'one', ylabel: 'zero' },
      { x: 5, y: 0.1, xlabel: 'five', ylabel: 'point one' },
      { x: 10, y: 20, xlabel: '', ylabel: '' },
      { x: 2, y: 30, xlabel: '', ylabel: '' },
      { x: 30, y: 40, xlabel: '', ylabel: '' },
      { x: 15, y: 500, xlabel: '', ylabel: '' },
    ],
  },
} satisfies Meta<typeof BarChart>

export default barCharMeta

type Story = StoryObj<typeof barCharMeta>

export const Default: Story = {}
export const ThinnerBars: Story = {
  args: {
    barWidth: 10,
  },
}
