import React from 'react'

import { render, screen } from 'uiSrc/utils/test-utils'
import ProcessingPerformance from './ProcessingPerformance'

const mockedProps = {
  data: {
    totalBatches: 1,
    batchSizeAvg: 2,
    processTimeAvg: 3,
    ackTimeAvg: 4,
    recPerSecAvg: 5,
    readTimeAvg: 6,
    totalTimeAvg: 7,
  },
  loading: false,
  onRefresh: jest.fn(),
  onRefreshClicked: jest.fn(),
  onChangeAutoRefresh: jest.fn(),
}

describe('ProcessingPerformance', () => {
  it('renders the processing performance information correctly', () => {
    render(<ProcessingPerformance {...mockedProps} />)

    expect(screen.getByText('Total batches')).toBeInTheDocument()
    expect(screen.getByText('Batch size average')).toBeInTheDocument()
    expect(screen.getByText('Process time average')).toBeInTheDocument()
    expect(screen.getByText('ACK time average')).toBeInTheDocument()
    expect(screen.getByText('Records per second average')).toBeInTheDocument()
    expect(screen.getByText('Read time average')).toBeInTheDocument()
    expect(screen.getByText('Total time average')).toBeInTheDocument()

    expect(screen.getByText(1)).toBeInTheDocument()
    expect(screen.getByText(2)).toBeInTheDocument()
    expect(screen.getByText(3)).toBeInTheDocument()
    expect(screen.getByText(4)).toBeInTheDocument()
    expect(screen.getByText(5)).toBeInTheDocument()
    expect(screen.getByText(6)).toBeInTheDocument()
    expect(screen.getByText(7)).toBeInTheDocument()
  })
})
