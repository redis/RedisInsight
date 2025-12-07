import React from 'react'
import { cloneDeep, set } from 'lodash'

import reactRouterDom from 'react-router-dom'
import {
  render,
  screen,
  fireEvent,
  mockedStore,
  cleanup,
  initialStateDefault,
  mockStore,
} from 'uiSrc/utils/test-utils'
import { resetDataRedisCluster } from 'uiSrc/slices/instances/cluster'
import { resetDataRedisCloud } from 'uiSrc/slices/instances/cloud'
import { resetDataSentinel } from 'uiSrc/slices/instances/sentinel'
import { FeatureFlags } from 'uiSrc/constants'
import PageHeader from './PageHeader'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn,
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('PageHeader', () => {
  it('should render', () => {
    expect(render(<PageHeader title="Page" />)).toBeTruthy()
  })

  it('should render proper components', () => {
    render(<PageHeader title="Page" subtitle="subtitle" />)

    expect(screen.getByTestId('page-title')).toHaveTextContent('Page')
    expect(screen.getByTestId('page-subtitle')).toHaveTextContent('subtitle')
  })

  it('should call proper actions after click logo', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(<PageHeader title="Page" subtitle="subtitle" />)

    fireEvent.click(screen.getByTestId('redis-logo-home'))

    expect(store.getActions()).toEqual([
      resetDataRedisCluster(),
      resetDataRedisCloud(),
      resetDataSentinel(),
    ])

    expect(pushMock).toBeCalledWith('/')
    pushMock.mockRestore()
  })

  it('should render custom component', () => {
    render(
      <PageHeader title="Page" showInsights>
        <div data-testid="custom-logo" />
      </PageHeader>,
    )

    expect(screen.getByTestId('custom-logo')).toBeInTheDocument()
    expect(screen.queryByTestId('redis-logo-home')).not.toBeInTheDocument()
  })

  it('should show feature dependent items when feature flag is on', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.cloudSso}`,
      { flag: true },
    )

    render(<PageHeader title="Page" subtitle="subtitle" showInsights />, {
      store: mockStore(initialStoreState),
    })
    expect(screen.queryByTestId('o-auth-user-profile')).toBeInTheDocument()
  })

  it('should hide feature dependent items when feature flag is off', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.cloudSso}`,
      { flag: false },
    )

    render(<PageHeader title="Page" subtitle="subtitle" showInsights />, {
      store: mockStore(initialStoreState),
    })
    expect(screen.queryByTestId('o-auth-user-profile')).not.toBeInTheDocument()
  })
})
