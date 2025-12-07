import React from 'react'

import { render, screen } from 'uiSrc/utils/test-utils'
import Clients from './Clients'

const mockedProps = {
  data: {
    client1: {
      id: 'client1',
      addr: '127.0.0.1',
      name: 'Client 1',
      ageSec: 11,
      idleSec: 5,
      user: 'user1',
    },
    client2: {
      id: 'client2',
      addr: '127.0.0.2',
      name: 'Client 2',
      ageSec: 20,
      idleSec: 12,
      user: 'user2',
    },
  },
  loading: false,
  onRefresh: jest.fn(),
  onRefreshClicked: jest.fn(),
  onChangeAutoRefresh: jest.fn(),
}

describe('Clients', () => {
  it('renders the clients table', () => {
    render(<Clients {...mockedProps} />)

    // Assert that the table columns are rendered
    const columnHeaders = screen.getAllByRole('columnheader')
    expect(columnHeaders).toHaveLength(6) // 6 columns

    // Assert that the data rows are rendered
    const dataRows = screen.getAllByRole('row')
    expect(dataRows).toHaveLength(3) // 2 data rows + 1 header row
  })
})
