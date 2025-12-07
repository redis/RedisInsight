import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import { IRoute } from 'uiSrc/constants'
import PipelinePageRouter from './PipelineManagementPageRouter'

const mockedRoutes = [
  {
    path: '/page',
  },
]

describe('PipelinePageRouter', () => {
  it('should render', () => {
    expect(
      render(<PipelinePageRouter routes={mockedRoutes as IRoute[]} />, {
        withRouter: true,
      }),
    ).toBeTruthy()
  })
})
