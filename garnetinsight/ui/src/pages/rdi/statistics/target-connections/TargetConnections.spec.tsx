import React from 'react'

import { render, screen } from 'uiSrc/utils/test-utils'
import TargetConnections from './TargetConnections'

const mockedProps = {
  data: {
    connection1: {
      status: 'good',
      name: 'Connection 1',
      type: 'Type 1',
      host: 'localhost',
      port: 6379,
      database: 'DB 1',
      user: 'User 1',
    },
    connection2: {
      status: 'bad',
      name: 'Connection 2',
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
