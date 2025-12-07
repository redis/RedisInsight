import { cloneDeep, set } from 'lodash'
import React from 'react'
import reactRouterDom from 'react-router-dom'

import {
  cleanup,
  fireEvent,
  initialStateDefault,
  mockedStore,
  mockStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { FeatureFlags } from 'uiSrc/constants'
import RdiInstanceHeader from './RdiInstanceHeader'

jest.mock('uiSrc/slices/rdi/instances', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    name: 'name',
  }),
}))

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

describe('RdiInstanceHeader', () => {
  it('should render', () => {
    expect(render(<RdiInstanceHeader />)).toBeTruthy()
  })

  it('should call history push with proper path', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(<RdiInstanceHeader />)

    fireEvent.click(screen.getByTestId('my-rdi-instances-btn'))

    expect(pushMock).toHaveBeenCalledTimes(1)
    expect(pushMock).toHaveBeenCalledWith('/integrate')
  })

  it('should render proper instance name', () => {
    expect(render(<RdiInstanceHeader />)).toBeTruthy()

    expect(screen.getByText('name')).toBeInTheDocument()
  })

  it('should show feature dependent items when feature flag is on', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.cloudSso}`,
      { flag: true },
    )

    render(<RdiInstanceHeader />, {
      store: mockStore(initialStoreState),
    })
    expect(screen.queryByTestId('o-auth-user-profile-rdi')).toBeInTheDocument()
  })

  it('should hide feature dependent items when feature flag is off', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.cloudSso}`,
      { flag: false },
    )

    render(<RdiInstanceHeader />, {
      store: mockStore(initialStoreState),
    })
    expect(
      screen.queryByTestId('o-auth-user-profile-rdi'),
    ).not.toBeInTheDocument()
  })
})
