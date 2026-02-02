import React from 'react'
import { mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'

import MonitorOutputList, { Props } from './MonitorOutputList'

const mockedProps = {
  ...mock<Props>(),
  height: 20,
  width: 20,
}

describe('MonitorOutputList', () => {
  it('should render', () => {
    expect(render(<MonitorOutputList {...mockedProps} />)).toBeTruthy()
  })

  it('should render items properly', () => {
    const item = { time: '112', args: ['ttl'], source: '12', database: '0' }
    const mockItems = [item, item]
    render(<MonitorOutputList {...mockedProps} items={mockItems} />)
    expect(screen.getByTestId('row-0')).toBeInTheDocument()
    expect(screen.getByTestId('row-1')).toBeInTheDocument()
  })
})
