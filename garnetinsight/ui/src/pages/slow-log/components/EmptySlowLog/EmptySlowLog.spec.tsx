import React from 'react'
import { DurationUnits } from 'uiSrc/constants'
import { render } from 'uiSrc/utils/test-utils'

import EmptySlowLog from './EmptySlowLog'

describe('EmptySlowLog', () => {
  it('should render', () => {
    expect(
      render(
        <EmptySlowLog
          durationUnit={DurationUnits.milliSeconds}
          slowlogLogSlowerThan={100}
        />,
      ),
    ).toBeTruthy()
  })
  it('should contain msec instead of ms', () => {
    const { container } = render(
      <EmptySlowLog
        durationUnit={DurationUnits.milliSeconds}
        slowlogLogSlowerThan={10000000}
      />,
    )

    expect(container).toHaveTextContent('10 000 msec')
  })
})
