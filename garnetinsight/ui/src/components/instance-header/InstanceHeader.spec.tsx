import { cloneDeep, set } from 'lodash'
import React from 'react'
import reactRouterDom from 'react-router-dom'
import { instance, mock } from 'ts-mockito'
import {
  cleanup,
  act,
  fireEvent,
  initialStateDefault,
  mockedStore,
  mockStore,
  render,
  screen,
  waitFor,
} from 'uiSrc/utils/test-utils'
import {
  checkDatabaseIndex,
  connectedInstanceInfoSelector,
  connectedInstanceSelector,
} from 'uiSrc/slices/instances/instances'
import { appContextDbIndex } from 'uiSrc/slices/app/context'

import { FeatureFlags } from 'uiSrc/constants'
import InstanceHeader, { Props } from './InstanceHeader'

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  sessionStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceInfoSelector: jest.fn().mockReturnValue({
    databases: 16,
  }),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    username: 'username',
    id: 'instanceId',
    loading: false,
  }),
}))

jest.mock('uiSrc/slices/app/context', () => ({
  ...jest.requireActual('uiSrc/slices/app/context'),
  appContextDbIndex: jest.fn().mockReturnValue({
    disabled: false,
  }),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn,
  }),
}))

describe('InstanceHeader', () => {
  it('should render', () => {
    expect(render(<InstanceHeader {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render change index button with databases = 1', () => {
    ;(connectedInstanceInfoSelector as jest.Mock).mockReturnValueOnce({
      databases: 1,
    })

    render(<InstanceHeader {...instance(mockedProps)} />)

    expect(screen.queryByTestId('change-index-btn')).not.toBeInTheDocument()
  })

  it('should render change index button', () => {
    render(<InstanceHeader {...instance(mockedProps)} />)

    expect(screen.getByTestId('change-index-btn')).toBeInTheDocument()
  })

  it('should render change index input after click on the button', () => {
    render(<InstanceHeader {...instance(mockedProps)} />)

    fireEvent.click(screen.getByTestId('change-index-btn'))

    expect(screen.getByTestId('change-index-input')).toBeInTheDocument()
  })

  it('should call proper actions after changing database index', () => {
    render(<InstanceHeader {...instance(mockedProps)} />)

    fireEvent.click(screen.getByTestId('change-index-btn'))

    fireEvent.change(screen.getByTestId('change-index-input'), {
      target: { value: 3 },
    })

    expect(screen.getByTestId('change-index-input')).toHaveValue('3')
    fireEvent.click(screen.getByTestId('apply-btn'))

    // check if store actions contain proper action: {type: "instances/checkDatabaseIndex"}
    expect(store.getActions()).toContainEqual(
      expect.objectContaining(checkDatabaseIndex()),
    )
  })

  it('should be disabled db index button with loading state', () => {
    ;(connectedInstanceSelector as jest.Mock).mockReturnValueOnce({
      loading: true,
    })

    render(<InstanceHeader {...instance(mockedProps)} />)

    expect(screen.getByTestId('change-index-btn')).toBeDisabled()
  })

  it('should be disabled db index button with disabled state', () => {
    ;(appContextDbIndex as jest.Mock).mockReturnValueOnce({
      disabled: true,
    })

    render(<InstanceHeader {...instance(mockedProps)} />)

    expect(screen.getByTestId('change-index-btn')).toBeDisabled()
  })

  it('should call history push with proper path', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    render(<InstanceHeader {...instance(mockedProps)} />)

    fireEvent.click(screen.getByTestId('my-redis-db-btn'))

    expect(pushMock).toHaveBeenCalledTimes(1)
    expect(pushMock).toHaveBeenCalledWith('/')
  })

  it('should show env dependent items when feature flag is on', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: true },
    )

    render(<InstanceHeader {...instance(mockedProps)} />, {
      store: mockStore(initialStoreState),
    })
    expect(screen.queryByTestId('my-redis-db-btn')).toBeInTheDocument()
    expect(
      screen.queryByTestId('admin-console-breadcrumb-btn'),
    ).not.toBeInTheDocument()
  })

  it('should not show env dependent items button when feature flag is off', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: false },
    )
    set(initialStoreState, 'user.cloudProfile', { data: {} })

    render(<InstanceHeader {...instance(mockedProps)} />, {
      store: mockStore(initialStoreState),
    })

    expect(screen.queryByTestId('my-redis-db-btn')).not.toBeInTheDocument()
  })

  it('should show cloud user profile if env dependant flag is off and cloud profile is present', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: false },
    )
    set(initialStoreState, 'user.cloudProfile', {
      data: {
        id: 123,
        name: 'John Smith',
        currentAccountId: '40',
        accounts: [{ id: '40', name: 'Test account' }],
      },
    })

    render(<InstanceHeader {...instance(mockedProps)} />, {
      store: mockStore(initialStoreState),
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId('user-profile-btn'))
    })
    await waitFor(() => {
      expect(
        screen.queryByTestId('user-profile-popover-content'),
      ).toBeInTheDocument()
    })

    expect(screen.queryByTestId('cloud-user-profile-badge')).toBeInTheDocument()
    expect(
      screen.queryByTestId('profile-import-cloud-databases'),
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId('profile-logout')).not.toBeInTheDocument()
    expect(screen.queryByTestId('cloud-admin-console-link')).toBeInTheDocument()
    expect(
      screen.queryByTestId('profile-account-40-selected'),
    ).toHaveTextContent('Test account #40')
  })

  it('should show sso user profile if env dependant flag and cloud-sso features are on', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.cloudSso}`,
      { flag: true },
    )
    set(initialStoreState, 'oauth.cloud.user', {
      data: {
        id: 123,
        name: 'John Smith',
        currentAccountId: '40',
        accounts: [{ id: '40', name: 'Test account' }],
      },
    })

    render(<InstanceHeader {...instance(mockedProps)} />, {
      store: mockStore(initialStoreState),
    })

    await act(async () => {
      fireEvent.click(screen.getByTestId('user-profile-btn'))
    })
    await waitFor(() => {
      expect(
        screen.queryByTestId('user-profile-popover-content'),
      ).toBeInTheDocument()
    })

    expect(screen.queryByTestId('oauth-user-profile-badge')).toBeInTheDocument()
    expect(
      screen.queryByTestId('profile-import-cloud-databases'),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('profile-logout')).toBeInTheDocument()
    expect(
      screen.queryByTestId('cloud-admin-console-link'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('profile-account-40-selected'),
    ).toHaveTextContent('Test account #40')
  })

  it('should not show sso user profile if cloud ads feature is off', async () => {
    const initialStoreState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.cloudAds}`,
      { flag: false },
    )

    render(<InstanceHeader {...instance(mockedProps)} />, {
      store: mockStore(initialStoreState),
    })

    expect(
      screen.queryByTestId('oauth-user-profile-badge'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('cloud-user-profile-badge'),
    ).not.toBeInTheDocument()
  })
})
