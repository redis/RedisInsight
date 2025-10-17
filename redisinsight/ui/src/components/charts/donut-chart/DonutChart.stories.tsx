import type { Meta, StoryObj } from '@storybook/react-vite'

import DonutChart from './index'

const donutChartMeta = {
  component: DonutChart,
  args: {
    width: 400,
    height: 200,
    name: 'test',
    data: [
      { value: 1, name: 'A', color: [0, 0, 0] },
      { value: 5, name: 'B', color: [10, 10, 10] },
      { value: 10, name: 'C', color: [20, 20, 20] },
      { value: 2, name: 'D', color: [30, 30, 30] },
      { value: 30, name: 'E', color: [40, 40, 40] },
      { value: 15, name: 'F', color: [50, 50, 50] },
    ],
  },
} satisfies Meta<typeof DonutChart>

export default donutChartMeta

type Story = StoryObj<typeof donutChartMeta>

export const Default: Story = {}
