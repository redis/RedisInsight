import type { Meta, StoryObj } from '@storybook/react-vite'
import AreaChart from './index'

const areaChart = {
  component: AreaChart,
  args: {
    width: 400,
    height: 200,
    name: 'test',
    data: [
      { x: 1, y: 0, xlabel: '', ylabel: '' },
      { x: 5, y: 10, xlabel: '', ylabel: '' },
      { x: 10, y: 20, xlabel: '', ylabel: '' },
      { x: 2, y: 30, xlabel: '', ylabel: '' },
      { x: 30, y: 40, xlabel: '', ylabel: '' },
      { x: 15, y: 50000, xlabel: '', ylabel: '' },
    ],
  },
} satisfies Meta<typeof AreaChart>

export default areaChart

type Story = StoryObj<typeof areaChart>

export const Default: Story = {}
