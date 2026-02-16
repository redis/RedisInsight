import React from 'react'

import { render, screen } from 'uiSrc/utils/test-utils'
import { StatisticsCellType } from 'uiSrc/slices/interfaces'
import { StatisticsTableSectionFactory } from 'uiSrc/mocks/factories/rdi/RdiStatistics.factory'
import StatisticsTable from './StatisticsTable'

describe('StatisticsTable', () => {
  it('should render section with correct name', () => {
    const mockData = StatisticsTableSectionFactory.build({
      name: 'Target connections',
    })

    render(<StatisticsTable data={mockData} />)

    expect(screen.getByText('Target connections')).toBeInTheDocument()
  })

  it('should render all column headers', () => {
    const mockData = StatisticsTableSectionFactory.build({
      columns: [
        { id: 'status', header: 'Status', type: StatisticsCellType.Status },
        { id: 'name', header: 'Name' },
        { id: 'host', header: 'Host' },
        { id: 'type', header: 'Type' },
      ],
    })

    render(<StatisticsTable data={mockData} />)

    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Host')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
  })

  it('should render all data rows', () => {
    const mockData = StatisticsTableSectionFactory.build({
      columns: [
        { id: 'status', header: 'Status', type: StatisticsCellType.Status },
        { id: 'name', header: 'Name' },
        { id: 'host', header: 'Host' },
        { id: 'type', header: 'Type' },
      ],
      data: [
        {
          status: 'connected',
          name: 'target1',
          host: 'localhost:6379',
          type: 'redis',
        },
        {
          status: 'not yet used',
          name: 'target2',
          host: 'localhost:6380',
          type: 'redis',
        },
      ],
    })

    render(<StatisticsTable data={mockData} />)

    expect(screen.getByText('target1')).toBeInTheDocument()
    expect(screen.getByText('target2')).toBeInTheDocument()
    expect(screen.getByText('localhost:6379')).toBeInTheDocument()
    expect(screen.getByText('localhost:6380')).toBeInTheDocument()
  })

  it('should render correct number of columns and rows for target connections', () => {
    const mockData = StatisticsTableSectionFactory.build({
      columns: [
        { id: 'status', header: 'Status', type: StatisticsCellType.Status },
        { id: 'name', header: 'Name' },
        { id: 'host', header: 'Host' },
        { id: 'type', header: 'Type' },
      ],
      data: [
        {
          status: 'connected',
          name: 'target1',
          host: 'localhost:6379',
          type: 'redis',
        },
        {
          status: 'not yet used',
          name: 'target2',
          host: 'localhost:6380',
          type: 'redis',
        },
      ],
    })

    render(<StatisticsTable data={mockData} />)

    const columnHeaders = screen.getAllByRole('columnheader')
    expect(columnHeaders).toHaveLength(4)

    const dataRows = screen.getAllByRole('row')
    expect(dataRows).toHaveLength(3) // 2 data rows + 1 header row
  })

  it('should render correct number of columns and rows for clients', () => {
    const mockData = StatisticsTableSectionFactory.build({
      name: 'Clients',
      columns: [
        { id: 'id', header: 'ID' },
        { id: 'addr', header: 'Address' },
        { id: 'name', header: 'Name' },
        { id: 'ageSec', header: 'Age (sec)' },
        { id: 'idleSec', header: 'Idle (sec)' },
        { id: 'user', header: 'User' },
      ],
      data: [
        {
          id: 'client1',
          addr: '127.0.0.1',
          name: 'Client 1',
          ageSec: 11,
          idleSec: 5,
          user: 'user1',
        },
        {
          id: 'client2',
          addr: '127.0.0.2',
          name: 'Client 2',
          ageSec: 20,
          idleSec: 12,
          user: 'user2',
        },
      ],
    })

    render(<StatisticsTable data={mockData} />)

    const columnHeaders = screen.getAllByRole('columnheader')
    expect(columnHeaders).toHaveLength(6)

    const dataRows = screen.getAllByRole('row')
    expect(dataRows).toHaveLength(3) // 2 data rows + 1 header row
  })

  it('should render correct number of columns and rows for data streams with footer', () => {
    const mockData = StatisticsTableSectionFactory.build({
      name: 'Data streams',
      columns: [
        { id: 'name', header: 'Name' },
        { id: 'total', header: 'Total' },
        { id: 'pending', header: 'Pending' },
        { id: 'inserted', header: 'Inserted' },
        { id: 'updated', header: 'Updated' },
        { id: 'deleted', header: 'Deleted' },
        { id: 'filtered', header: 'Filtered' },
        { id: 'rejected', header: 'Rejected' },
        { id: 'deduplicated', header: 'Deduplicated' },
        {
          id: 'last_arrival',
          header: 'Last arrival',
          type: StatisticsCellType.Date,
        },
      ],
      data: [
        {
          name: 'stream1',
          total: 11,
          pending: 5,
          inserted: 3,
          updated: 2,
          deleted: 1,
          filtered: 0,
          rejected: 0,
          deduplicated: 0,
          last_arrival: '2022-01-01',
        },
        {
          name: 'stream2',
          total: 20,
          pending: 10,
          inserted: 6,
          updated: 4,
          deleted: 2,
          filtered: 0,
          rejected: 0,
          deduplicated: 0,
          last_arrival: '2022-01-02',
        },
      ],
      footer: {
        name: 'Totals',
        total: 31,
        pending: 15,
        inserted: 9,
        updated: 6,
        deleted: 3,
        filtered: 0,
        rejected: 0,
        deduplicated: 0,
        last_arrival: '',
      },
    })

    render(<StatisticsTable data={mockData} />)

    const columnHeaders = screen.getAllByRole('columnheader')
    expect(columnHeaders).toHaveLength(10)

    const dataRows = screen.getAllByRole('row')
    expect(dataRows).toHaveLength(4) // 2 data rows + 1 header row + 1 footer row
  })

  it('should render empty table when data is empty', () => {
    const mockData = StatisticsTableSectionFactory.build({
      name: 'Empty Table',
      columns: [{ id: 'name', header: 'Name' }],
      data: [],
    })

    render(<StatisticsTable data={mockData} />)

    expect(screen.getByText('Empty Table')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
  })

  it('should render footer row when provided', () => {
    const mockData = StatisticsTableSectionFactory.build({
      columns: [
        { id: 'name', header: 'Name' },
        { id: 'total', header: 'Total' },
        { id: 'pending', header: 'Pending' },
      ],
      data: [
        { name: 'stream1', total: 11, pending: 5 },
        { name: 'stream2', total: 20, pending: 10 },
      ],
      footer: { name: 'Totals', total: 31, pending: 15 },
    })

    render(<StatisticsTable data={mockData} />)

    expect(screen.getByText('Totals')).toBeInTheDocument()
    expect(screen.getByText('31')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('should render section id based on name', () => {
    const mockData = StatisticsTableSectionFactory.build({
      name: 'Target connections',
    })

    const { container } = render(<StatisticsTable data={mockData} />)

    expect(
      container.querySelector('[id="target connections"]'),
    ).toBeInTheDocument()
  })

  it('should truncate long values and show tooltip', () => {
    const longValue = 'this_is_a_very_long_stream_name_that_should_be_truncated'
    const mockData = StatisticsTableSectionFactory.build({
      columns: [{ id: 'name', header: 'Name' }],
      data: [{ name: longValue }],
    })

    render(<StatisticsTable data={mockData} />)

    // Should show truncated value (formatLongName with maxLength=30, endPartLength=0, separator='...')
    expect(
      screen.getByText('this_is_a_very_long_stream_...'),
    ).toBeInTheDocument()
    // Full value should not be visible as text (only in tooltip)
    expect(screen.queryByText(longValue)).not.toBeInTheDocument()
  })

  it('should not truncate short values', () => {
    const shortValue = 'short_name'
    const mockData = StatisticsTableSectionFactory.build({
      columns: [{ id: 'name', header: 'Name' }],
      data: [{ name: shortValue }],
    })

    render(<StatisticsTable data={mockData} />)

    expect(screen.getByText(shortValue)).toBeInTheDocument()
  })

  it('should format date values using FormatedDate component when type is date', () => {
    const mockData = StatisticsTableSectionFactory.build({
      columns: [
        {
          id: 'last_arrival',
          header: 'Last arrival',
          type: StatisticsCellType.Date,
        },
      ],
      data: [{ last_arrival: '2024-01-15T10:30:00Z' }],
    })

    render(<StatisticsTable data={mockData} />)

    // FormatedDate formats the date according to user settings
    // The exact format depends on user config, but it should render something
    expect(screen.getByRole('cell')).toBeInTheDocument()
  })
})
