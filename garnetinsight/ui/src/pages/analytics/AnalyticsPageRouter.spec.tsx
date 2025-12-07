import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import AnalyticsPageRouter from './AnalyticsPageRouter'

const mockedRoutes = [
  {
    path: '/slowlog',
  },
]

describe('AnalyticsPageRouter', () => {
  it('should render', () => {
    expect(
      render(<AnalyticsPageRouter routes={mockedRoutes} />, {
        withRouter: true,
      }),
    ).toBeTruthy()
  })
})
