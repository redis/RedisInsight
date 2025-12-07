import React from 'react'
import { mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'

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
    const { container } = render(
      <MonitorOutputList {...mockedProps} items={mockItems} />,
    )
    expect(container.getElementsByClassName('item').length).toBe(2)
  })
})
