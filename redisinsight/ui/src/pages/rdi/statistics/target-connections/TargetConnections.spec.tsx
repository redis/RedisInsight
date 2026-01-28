import React from 'react'

import { render, screen } from 'uiSrc/utils/test-utils'
import { StatisticsConnectionStatus } from 'uiSrc/slices/interfaces'
import TargetConnections, { Props } from './TargetConnections'

const mockedProps: Props = {
  data: {
    connection1: {
      status: StatisticsConnectionStatus.connected,
      type: 'Type 1',
      host: 'localhost',
      port: 6379,
      database: 'DB 1',
      user: 'User 1',
    },
    connection2: {
      status: StatisticsConnectionStatus.notYetUsed,
      type: 'Type 2',
      host: '127.0.0.1',
      port: 6380,
      database: 'DB 2',
      user: 'User 2',
    },
  },
}

describe('TargetConnections', () => {
  it('renders the target connections table', () => {
    render(<TargetConnections {...mockedProps} />)

    // Assert that the table columns are rendered
    const columnHeaders = screen.getAllByRole('columnheader')
    expect(columnHeaders).toHaveLength(6) // 6 columns

    // Assert that the data rows are rendered
    const dataRows = screen.getAllByRole('row')
    expect(dataRows).toHaveLength(3) // 2 data rows + 1 header row
  })
})
