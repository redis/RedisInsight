import type { Meta, StoryObj } from '@storybook/react-vite'

import DonutChart from './index'

const donutChartMeta: Meta<typeof DonutChart> = {
  component: DonutChart,
  args: {
    width: 400,
    height: 200,
    name: 'test',
    data: [
      { value: 1, name: 'A', color: [231, 76, 60] }, // Red
      { value: 5, name: 'B', color: [52, 152, 219] }, // Blue
      { value: 10, name: 'C', color: [46, 204, 113] }, // Green
      { value: 2, name: 'D', color: [241, 196, 15] }, // Yellow
      { value: 30, name: 'E', color: [155, 89, 182] }, // Purple
      { value: 15, name: 'F', color: [230, 126, 34] }, // Orange
    ],
  },
}

export default donutChartMeta

type Story = StoryObj<typeof donutChartMeta>

export const Default: Story = {}
