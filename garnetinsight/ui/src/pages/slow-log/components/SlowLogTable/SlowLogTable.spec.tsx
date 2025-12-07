import React from 'react'
import { mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'

import SlowLogTable, { Props } from './SlowLogTable'

const mockedProps = mock<Props>()

const mockedData = [
  {
    id: 0,
    time: 1652429583,
    durationUs: 56,
    args: 'info',
    source: '0.0.0.1:50834',
    client: 'garnetinsight-common-0',
  },
  {
    id: 1,
    time: 1652429583,
    durationUs: 11,
    args: 'config get slowlog*',
    source: '0.0.0.1:50834',
    client: 'garnetinsight-common-0',
  },
]

describe('SlowLogTable', () => {
  it('should render', () => {
    expect(render(<SlowLogTable {...mockedProps} items={[]} />)).toBeTruthy()
  })

  it('should render data', () => {
    const { container } = render(
      <SlowLogTable {...mockedProps} items={mockedData} />,
    )

    expect(container).toBeTruthy()

    const rows = container.querySelectorAll('[data-row-type="regular"]')
    expect(rows).toHaveLength(mockedData.length)
  })
})
