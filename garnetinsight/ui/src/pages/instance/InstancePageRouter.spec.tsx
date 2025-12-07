import React from 'react'
import { screen } from '@testing-library/react'
import reactRouterDom, { MemoryRouter, Route } from 'react-router-dom'
import { render } from 'uiSrc/utils/test-utils'
import { PageNames, Pages } from 'uiSrc/constants'
import InstancePageRouter from './InstancePageRouter'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
}))

const MockComponent = () => <div data-testid="mock-component">Test match</div>

const mockedRoutes = [
  {
    path: '/redis-enterprise-autodiscovery',
  },
]

const mockComponentRoutes = [
  {
    pageName: PageNames.browser,
    path: Pages.browser(':instanceId'),
    component: MockComponent,
  },
]

describe('InstancePageRouter', () => {
  it('should render', () => {
    expect(
      render(<InstancePageRouter routes={mockedRoutes} />, {
        withRouter: true,
      }),
    ).toBeTruthy()
  })

  it('should not render 404 when route matches', () => {
    render(
      <MemoryRouter initialEntries={[Pages.browser('123')]}>
        <InstancePageRouter routes={mockComponentRoutes} />
        <Route path="/not-found">
          <div>Not found</div>
        </Route>
      </MemoryRouter>,
    )

    expect(screen.queryByText('Not found')).not.toBeInTheDocument()
    expect(screen.queryByTestId('mock-component')).toBeInTheDocument()
  })

  it('should redirect to the 404 page when unmatched route is used', async () => {
    const pushMock = jest.fn()
    jest
      .spyOn(reactRouterDom, 'useHistory')
      .mockReturnValue({ push: pushMock } as any)

    render(
      <MemoryRouter initialEntries={['/foo/bar']}>
        <InstancePageRouter routes={mockComponentRoutes} />
        <Route path="/not-found">
          <div>Not found</div>
        </Route>
      </MemoryRouter>,
    )

    expect(screen.queryByText('Not found')).toBeInTheDocument()
    expect(screen.queryByTestId('mock-component')).not.toBeInTheDocument()
  })
})
