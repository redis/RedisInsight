import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import { IRoute } from 'uiSrc/constants'
import InstancePageRouter from './InstancePageRouter'

const mockedRoutes = [
  {
    path: '/path',
  },
]

describe('InstancePageRouter', () => {
  it('should render', () => {
    expect(
      render(<InstancePageRouter routes={mockedRoutes as IRoute[]} />, {
        withRouter: true,
      }),
    ).toBeTruthy()
  })
})
