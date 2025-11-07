import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import { TransformGroupResult } from 'uiSrc/slices/interfaces'

import TestConnectionsLog from './TestConnectionsLog'

describe('TestConnectionsLog', () => {
  it('should render', () => {
    const mockedData: TransformGroupResult = { fail: [], success: [] }
    render(<TestConnectionsLog data={mockedData} />)
  })

  it('should render the correct status when only failed connections exist', () => {
    const mockedData: TransformGroupResult = {
      fail: [{ target: 'localhost:1233', error: 'some error' }],
      success: [],
    }
    render(<TestConnectionsLog data={mockedData} />)

    expect(screen.queryByText('Successful')).not.toBeInTheDocument()
    expect(screen.queryByText('some error')).toBeInTheDocument()
  })

  it('should render all results', () => {
    const mockedData: TransformGroupResult = {
      fail: [
        { target: 'localhost:1233', error: 'some error' },
        { target: 'localhost:1234', error: 'timeout' },
      ],
      success: [{ target: 'localhost:1235' }],
    }

    render(<TestConnectionsLog data={mockedData} />)

    expect(screen.queryAllByText('Successful').length).toEqual(1)
    expect(screen.queryAllByText('some error').length).toEqual(1)
    expect(screen.queryAllByText('timeout').length).toEqual(1)
  })
})
