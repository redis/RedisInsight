import React from 'react'
import { faker } from '@faker-js/faker'
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

// ============================================================================
// Story: Default - Basic bar chart with mixed values
// ============================================================================

export const Default: Story = {
  args: {
    width: 600,
    height: 300,
    name: 'default',
    data: [
      { x: 1, y: 0, xlabel: 'one', ylabel: 'zero' },
      { x: 5, y: 0.1, xlabel: 'five', ylabel: 'point one' },
      { x: 10, y: 20, xlabel: 'ten', ylabel: '' },
      { x: 2, y: 30, xlabel: 'two', ylabel: '' },
      { x: 30, y: 40, xlabel: 'thirty', ylabel: '' },
      { x: 15, y: 500, xlabel: 'fifteen', ylabel: '' },
    ],
  },
}

// ============================================================================
// Story: ThinnerBars - Narrow bar width
// ============================================================================

export const ThinnerBars: Story = {
  args: {
    width: 600,
    height: 300,
    name: 'thin-bars',
    barWidth: 10,
    data: [
      { x: 1, y: 100, xlabel: 'A', ylabel: '' },
      { x: 2, y: 200, xlabel: 'B', ylabel: '' },
      { x: 3, y: 150, xlabel: 'C', ylabel: '' },
      { x: 4, y: 300, xlabel: 'D', ylabel: '' },
      { x: 5, y: 250, xlabel: 'E', ylabel: '' },
    ],
  },
}

// ============================================================================
// Story: WiderBars - Wide bar width
// ============================================================================

export const WiderBars: Story = {
  args: {
    width: 600,
    height: 300,
    name: 'wide-bars',
    barWidth: 80,
    data: [
      { x: 1, y: 100, xlabel: 'A', ylabel: '' },
      { x: 2, y: 200, xlabel: 'B', ylabel: '' },
      { x: 3, y: 150, xlabel: 'C', ylabel: '' },
    ],
  },
}

// ============================================================================
// Story: BytesDataType - Memory usage with bytes formatting
// ============================================================================

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

// ============================================================================
// Story: DividedLastColumn - With dashed line separator
// ============================================================================

export const DividedLastColumn: Story = {
  args: {
    width: 700,
    height: 300,
    name: 'divided',
    divideLastColumn: true,
    data: [
      { x: 1, y: 100, xlabel: 'Active', ylabel: '' },
      { x: 2, y: 200, xlabel: 'Expired', ylabel: '' },
      { x: 3, y: 150, xlabel: 'Pending', ylabel: '' },
      { x: 4, y: 300, xlabel: 'Archived', ylabel: '' },
      { x: 5, y: 800, xlabel: 'No Expiry', ylabel: '' },
    ],
  },
}

// ============================================================================
// Story: CustomTooltips - Custom tooltip formatting
// ============================================================================

export const CustomTooltips: Story = {
  args: {
    width: 600,
    height: 300,
    name: 'custom-tooltips',
    data: [
      { x: 1, y: 1250, xlabel: 'Q1', ylabel: '' },
      { x: 2, y: 3400, xlabel: 'Q2', ylabel: '' },
      { x: 3, y: 2800, xlabel: 'Q3', ylabel: '' },
      { x: 4, y: 4100, xlabel: 'Q4', ylabel: '' },
    ],
    tooltipValidation: (val) => `$${(val / 1000).toFixed(1)}K Revenue`,
  },
}

// ============================================================================
// Story: CustomAxisFormatters - Custom left and bottom axis labels
// ============================================================================

export const CustomAxisFormatters: Story = {
  args: {
    width: 600,
    height: 300,
    name: 'custom-axis',
    data: [
      { x: 0, y: 25, xlabel: 'Jan', ylabel: '25%' },
      { x: 1, y: 40, xlabel: 'Feb', ylabel: '40%' },
      { x: 2, y: 65, xlabel: 'Mar', ylabel: '65%' },
      { x: 3, y: 90, xlabel: 'Apr', ylabel: '90%' },
      { x: 4, y: 100, xlabel: 'May', ylabel: '100%' },
    ],
    leftAxiosValidation: (val) => `${val}%`,
    bottomAxiosValidation: (_val, i) => {
      const labels = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May']
      return labels[Math.floor(i / 5)] || ''
    },
  },
}

// ============================================================================
// Story: LargeDataset - Many data points
// ============================================================================

const LargeDatasetRender = () => {
  const data = Array.from({ length: 20 }, (_, i) => ({
    x: i,
    y: faker.number.int({ min: 10, max: 500 }),
    xlabel: `Day ${i + 1}`,
    ylabel: '',
  }))

  return (
    <BarChart
      width={1200}
      height={400}
      name="large-dataset"
      data={data}
      barWidth={30}
    />
  )
}

export const LargeDataset: Story = {
  render: () => <LargeDatasetRender />,
}

// ============================================================================
// Story: SmallValues - Testing minimum bar height
// ============================================================================

export const SmallValues: Story = {
  args: {
    width: 600,
    height: 300,
    name: 'small-values',
    minBarHeight: 5,
    data: [
      { x: 1, y: 0.001, xlabel: 'Tiny', ylabel: '' },
      { x: 2, y: 0.1, xlabel: 'Small', ylabel: '' },
      { x: 3, y: 1, xlabel: 'Medium', ylabel: '' },
      { x: 4, y: 100, xlabel: 'Large', ylabel: '' },
      { x: 5, y: 0, xlabel: 'Zero', ylabel: '' },
    ],
  },
}

// ============================================================================
// Story: EmptyData - No data points
// ============================================================================

export const EmptyData: Story = {
  args: {
    width: 600,
    height: 300,
    name: 'empty',
    data: [],
  },
}

// ============================================================================
// Story: SingleBar - One data point
// ============================================================================

export const SingleBar: Story = {
  args: {
    width: 400,
    height: 300,
    name: 'single',
    data: [{ x: 1, y: 250, xlabel: 'Only One', ylabel: '250' }],
  },
}

// ============================================================================
// Story: HighYTickCount - More Y-axis ticks
// ============================================================================

export const HighYTickCount: Story = {
  args: {
    width: 600,
    height: 400,
    name: 'high-ticks',
    yCountTicks: 15,
    data: [
      { x: 1, y: 100, xlabel: 'A', ylabel: '' },
      { x: 2, y: 300, xlabel: 'B', ylabel: '' },
      { x: 3, y: 500, xlabel: 'C', ylabel: '' },
      { x: 4, y: 700, xlabel: 'D', ylabel: '' },
      { x: 5, y: 900, xlabel: 'E', ylabel: '' },
    ],
  },
}

// ============================================================================
// Story: AllPropsCustomized - Kitchen sink with all customizations
// ============================================================================

export const AllPropsCustomized: Story = {
  args: {
    width: 800,
    height: 400,
    name: 'kitchen-sink',
    barWidth: 50,
    minBarHeight: 4,
    yCountTicks: 10,
    divideLastColumn: true,
    multiplierGrid: 5,
    dataType: BarChartDataType.Bytes,
    data: [
      { x: 3600, y: 1024 * 1024 * 2, xlabel: '<1 hr', ylabel: '' },
      { x: 14400, y: 1024 * 1024 * 5, xlabel: '1-4 Hrs', ylabel: '' },
      { x: 43200, y: 1024 * 1024 * 8, xlabel: '4-12 Hrs', ylabel: '' },
      { x: 86400, y: 1024 * 1024 * 12, xlabel: '12-24 Hrs', ylabel: '' },
      { x: 604800, y: 1024 * 1024 * 6, xlabel: '1-7 Days', ylabel: '' },
      { x: 0, y: 1024 * 1024 * 20, xlabel: 'No Expiry', ylabel: '' },
    ],
    tooltipValidation: (val) =>
      `Memory: ${formatBytes(val, 3) as string} (extrapolated)`,
    leftAxiosValidation: (val, i) => (i % 2 ? '' : formatBytes(val, 1)),
    bottomAxiosValidation: (_val, i) => {
      const labels = [
        '',
        '<1 hr',
        '1-4 Hrs',
        '4-12 Hrs',
        '12-24 Hrs',
        '1-7 Days',
        'No Expiry',
      ]
      return labels[Math.floor(i / 5)] || ''
    },
  },
}
