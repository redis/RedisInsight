import React from 'react'

import { render, screen } from 'uiSrc/utils/test-utils'
import {
  StatisticsInfoSectionFactory,
  StatisticsInfoItemFactory,
} from 'uiSrc/mocks/factories/rdi/RdiStatistics.factory'
import StatisticsInfo from './StatisticsInfo'

describe('StatisticsInfo', () => {
  it('should render section title', () => {
    const mockData = StatisticsInfoSectionFactory.build({ name: 'General info' })

    render(<StatisticsInfo data={mockData} />)

    expect(screen.getByText('General info')).toBeInTheDocument()
  })

  it('should render all info items with labels and values', () => {
    const mockData = StatisticsInfoSectionFactory.build({
      data: [
        { label: 'RDI version', value: '1.0.0' },
        { label: 'RDI database address', value: 'redis://localhost:6379' },
        { label: 'Run status', value: 'running' },
        { label: 'Sync mode', value: 'streaming' },
      ],
    })

    render(<StatisticsInfo data={mockData} />)

    // Labels
    expect(screen.getByText('RDI version')).toBeInTheDocument()
    expect(screen.getByText('RDI database address')).toBeInTheDocument()
    expect(screen.getByText('Run status')).toBeInTheDocument()
    expect(screen.getByText('Sync mode')).toBeInTheDocument()

    // Values
    expect(screen.getByText('1.0.0')).toBeInTheDocument()
    expect(screen.getByText('redis://localhost:6379')).toBeInTheDocument()
    expect(screen.getByText('running')).toBeInTheDocument()
    expect(screen.getByText('streaming')).toBeInTheDocument()
  })

  it('should render empty section when data is empty', () => {
    const mockData = StatisticsInfoSectionFactory.build({
      name: 'Empty Info',
      data: [],
    })

    render(<StatisticsInfo data={mockData} />)

    expect(screen.getByText('Empty Info')).toBeInTheDocument()
  })

  it('should render single info item correctly', () => {
    const mockData = StatisticsInfoSectionFactory.build({
      name: 'Single Item',
      data: [StatisticsInfoItemFactory.build({ label: 'Status', value: 'active' })],
    })

    render(<StatisticsInfo data={mockData} />)

    expect(screen.getByText('Single Item')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('active')).toBeInTheDocument()
  })

  it('should handle empty string values', () => {
    const mockData = StatisticsInfoSectionFactory.build({
      name: 'Empty Values',
      data: [
        StatisticsInfoItemFactory.build({ label: 'Version', value: '' }),
        StatisticsInfoItemFactory.build({ label: 'Address', value: '' }),
      ],
    })

    render(<StatisticsInfo data={mockData} />)

    expect(screen.getByText('Empty Values')).toBeInTheDocument()
    expect(screen.getByText('Version')).toBeInTheDocument()
    expect(screen.getByText('Address')).toBeInTheDocument()
  })
})

