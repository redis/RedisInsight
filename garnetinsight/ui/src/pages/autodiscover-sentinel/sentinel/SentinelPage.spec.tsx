import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import SentinelPage, { Props } from './SentinelPage'

const mockedProps = mock<Props>()

const mockedRoutes = [
  {
    path: '/sentinel',
  },
]

/**
 * SentinelPage tests
 *
 * @group component
 */
describe('SentinelPage', () => {
  it('should render', () => {
    expect(
      render(<SentinelPage {...instance(mockedProps)} />, {
        withRouter: true,
      }),
    ).toBeTruthy()

    expect(
      render(<SentinelPage routes={mockedRoutes} />, { withRouter: true }),
    ).toBeTruthy()
  })
})
