import React from 'react'

import { render, screen } from 'uiSrc/utils/test-utils'
import {
  StatisticsBlocksSectionFactory,
  StatisticsBlockItemFactory,
} from 'uiSrc/mocks/factories/rdi/RdiStatistics.factory'
import StatisticsBlocks from './StatisticsBlocks'

describe('StatisticsBlocks', () => {
  it('should render section with correct name', () => {
    const mockData = StatisticsBlocksSectionFactory.build({
      name: 'Processing performance information',
    })

    render(<StatisticsBlocks data={mockData} />)

    expect(
      screen.getByText('Processing performance information'),
    ).toBeInTheDocument()
  })

  it('should render all block labels, values, and units', () => {
    const mockData = StatisticsBlocksSectionFactory.build({
      data: [
        StatisticsBlockItemFactory.build({ label: 'Total batches', value: 100, units: 'Total' }),
        StatisticsBlockItemFactory.build({ label: 'Batch size average', value: 1.5, units: 'MB' }),
        StatisticsBlockItemFactory.build({ label: 'Process time average', value: 50, units: 'ms' }),
        StatisticsBlockItemFactory.build({ label: 'ACK time average', value: 0.5, units: 'sec' }),
        StatisticsBlockItemFactory.build({ label: 'Read time average', value: 10, units: 'ms' }),
        StatisticsBlockItemFactory.build({ label: 'Records per second average', value: 1000, units: 'sec' }),
        StatisticsBlockItemFactory.build({ label: 'Total time average', value: 60, units: 'ms' }),
      ],
    })

    render(<StatisticsBlocks data={mockData} />)

    // Labels
    expect(screen.getByText('Total batches')).toBeInTheDocument()
    expect(screen.getByText('Batch size average')).toBeInTheDocument()
    expect(screen.getByText('Process time average')).toBeInTheDocument()
    expect(screen.getByText('ACK time average')).toBeInTheDocument()
    expect(screen.getByText('Read time average')).toBeInTheDocument()
    expect(screen.getByText('Records per second average')).toBeInTheDocument()
    expect(screen.getByText('Total time average')).toBeInTheDocument()

    // Values
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('1.5')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('0.5')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('1000')).toBeInTheDocument()
    expect(screen.getByText('60')).toBeInTheDocument()

    // Units
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('MB')).toBeInTheDocument()
    expect(screen.getAllByText('ms')).toHaveLength(3)
    expect(screen.getAllByText('sec')).toHaveLength(2)
  })

  it('should render empty section when data is empty', () => {
    const mockData = StatisticsBlocksSectionFactory.build({
      name: 'Empty Section',
      data: [],
    })

    render(<StatisticsBlocks data={mockData} />)

    expect(screen.getByText('Empty Section')).toBeInTheDocument()
  })

  it('should render single block in one column', () => {
    const mockData = StatisticsBlocksSectionFactory.build({
      name: 'Single Block',
      data: [StatisticsBlockItemFactory.build({ label: 'Test Label', value: 42, units: 'items' })],
    })

    render(<StatisticsBlocks data={mockData} />)

    expect(screen.getByText('Single Block')).toBeInTheDocument()
    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('items')).toBeInTheDocument()
  })

  it('should distribute blocks across columns correctly', () => {
    const mockData = StatisticsBlocksSectionFactory.build({
      name: 'Six Blocks',
      data: [
        StatisticsBlockItemFactory.build({ label: 'Block 1', value: 1, units: 'u1' }),
        StatisticsBlockItemFactory.build({ label: 'Block 2', value: 2, units: 'u2' }),
        StatisticsBlockItemFactory.build({ label: 'Block 3', value: 3, units: 'u3' }),
        StatisticsBlockItemFactory.build({ label: 'Block 4', value: 4, units: 'u4' }),
        StatisticsBlockItemFactory.build({ label: 'Block 5', value: 5, units: 'u5' }),
        StatisticsBlockItemFactory.build({ label: 'Block 6', value: 6, units: 'u6' }),
      ],
    })

    render(<StatisticsBlocks data={mockData} />)

    // All blocks should be rendered
    expect(screen.getByText('Block 1')).toBeInTheDocument()
    expect(screen.getByText('Block 2')).toBeInTheDocument()
    expect(screen.getByText('Block 3')).toBeInTheDocument()
    expect(screen.getByText('Block 4')).toBeInTheDocument()
    expect(screen.getByText('Block 5')).toBeInTheDocument()
    expect(screen.getByText('Block 6')).toBeInTheDocument()
  })

  it('should handle decimal and zero values', () => {
    const mockData = StatisticsBlocksSectionFactory.build({
      name: 'Decimal Values',
      data: [
        StatisticsBlockItemFactory.build({ label: 'Zero value', value: 0, units: 'count' }),
        StatisticsBlockItemFactory.build({ label: 'Small decimal', value: 0.001, units: 'sec' }),
        StatisticsBlockItemFactory.build({ label: 'Large number', value: 999999, units: 'records' }),
      ],
    })

    render(<StatisticsBlocks data={mockData} />)

    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('0.001')).toBeInTheDocument()
    expect(screen.getByText('999999')).toBeInTheDocument()
  })

  it('should render section id based on name', () => {
    const mockData = StatisticsBlocksSectionFactory.build({
      name: 'Processing performance information',
    })

    const { container } = render(<StatisticsBlocks data={mockData} />)

    // id is name.toLowerCase() which keeps spaces
    const section = container.querySelector(
      '[id="processing performance information"]',
    )
    expect(section).toBeInTheDocument()
  })
})

