import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import BarChart, { BarChartDataType } from './BarChart'
import { formatBytes } from 'uiSrc/utils'

const barChartMeta: Meta<typeof BarChart> = {
  component: BarChart,
  decorators: [
    (Story) => (
      <div style={{ padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
}

export default barChartMeta

type Story = StoryObj<typeof barChartMeta>

export const Default: Story = {
  args: {
    width: 600,
    height: 300,
    name: 'default',
    data: [
      { x: 1, y: 100, xlabel: 'A', ylabel: '' },
      { x: 2, y: 200, xlabel: 'B', ylabel: '' },
      { x: 3, y: 150, xlabel: 'C', ylabel: '' },
      { x: 4, y: 300, xlabel: 'D', ylabel: '' },
      { x: 5, y: 250, xlabel: 'E', ylabel: '' },
    ],
  },
}

export const BytesDataType: Story = {
  args: {
    width: 700,
    height: 350,
    name: 'memory-usage',
    dataType: BarChartDataType.Bytes,
    data: [
      { x: 3600, y: 1024 * 512, xlabel: '<1 hr', ylabel: '' },
      { x: 14400, y: 1024 * 1024 * 2, xlabel: '1-4 Hrs', ylabel: '' },
      { x: 43200, y: 1024 * 1024 * 5, xlabel: '4-12 Hrs', ylabel: '' },
      { x: 86400, y: 1024 * 1024 * 10, xlabel: '12-24 Hrs', ylabel: '' },
      { x: 604800, y: 1024 * 1024 * 3, xlabel: '1-7 Days', ylabel: '' },
      { x: 2592000, y: 1024 * 1024, xlabel: '>7 Days', ylabel: '' },
    ],
    tooltipValidation: (val) => formatBytes(val, 3) as string,
    leftAxiosValidation: (val, i) => (i % 2 ? '' : formatBytes(val, 1)),
  },
}
