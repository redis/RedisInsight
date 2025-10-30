import React from 'react'
import {
  cleanup,
  createMockedStore,
  mockedStore,
  render,
} from 'uiSrc/utils/test-utils'

import {
  CloudAuthStatus,
  CloudJobName,
  CloudJobStep,
} from 'uiSrc/electron/constants'
import {
  addFreeDb,
  fetchUserInfo,
  getPlans,
  getUserInfo,
  setJob,
  setOAuthCloudSource,
  setSocialDialogState,
  showOAuthProgress,
  signInFailure,
} from 'uiSrc/slices/oauth/cloud'
import {
  cloudSelector,
  loadSubscriptionsRedisCloud,
} from 'uiSrc/slices/instances/cloud'
import {
  addErrorNotification,
  addInfiniteNotification,
} from 'uiSrc/slices/app/notifications'
import { INFINITE_MESSAGES } from 'uiSrc/components/notifications/components'
import ConfigOAuth from './ConfigOAuth'

jest.mock('uiSrc/slices/oauth/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/cloud'),
  fetchUserInfo: jest
    .fn()
    .mockImplementation(
      jest.requireActual('uiSrc/slices/oauth/cloud').fetchUserInfo,
    ),
}))

jest.mock('uiSrc/slices/instances/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/instances/cloud'),
  cloudSelector: jest.fn().mockReturnValue({
    ...jest.requireActual('uiSrc/slices/instances/cloud').initialState,
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = createMockedStore()
  store.clearActions()
  window.app = {
    cloudOauthCallback: jest.fn(),
  } as any
})

const renderConfigOAuth = () => {
  return render(<ConfigOAuth />, { store })
}

describe('ConfigOAuth', () => {
  it('should render', () => {
    expect(render(<ConfigOAuth />)).toBeTruthy()
  })

  it('should call proper actions on success', () => {
    ;(cloudSelector as jest.Mock).mockReturnValue({
      ssoFlow: 'signIn',
    })

    window.app?.cloudOauthCallback.mockImplementation((cb: any) =>
      cb(undefined, { status: CloudAuthStatus.Succeed }),
    )
    renderConfigOAuth()

    const expectedActions = [
      setJob({
        id: '',
        name: CloudJobName.CreateFreeSubscriptionAndDatabase,
        status: '',
      }),
      showOAuthProgress(true),
      addInfiniteNotification(INFINITE_MESSAGES.AUTHENTICATING()),
      setSocialDialogState(null),
      getUserInfo(),
    ]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should call proper actions on failed', () => {
    ;(cloudSelector as jest.Mock).mockReturnValue({
      ssoFlow: 'signIn',
    })

    window.app?.cloudOauthCallback.mockImplementation((cb: any) =>
      cb(undefined, {
        status: CloudAuthStatus.Failed,
        error: 'error',
      }),
    )
    renderConfigOAuth()

    const expectedActions = [
      setOAuthCloudSource(null),
      signInFailure('error'),
      addErrorNotification({
        response: {
          data: {
            message: 'error',
          },
          status: 500,
        },
      } as any),
    ]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should fetch plans with create flow', () => {
    ;(cloudSelector as jest.Mock).mockReturnValue({
      ssoFlow: 'create',
    })

    const fetchUserInfoMock = jest
      .fn()
      .mockImplementation(
        (onSuccessAction: () => void) => () => onSuccessAction(),
      )
    ;(fetchUserInfo as jest.Mock).mockImplementation(fetchUserInfoMock)

    window.app?.cloudOauthCallback.mockImplementation((cb: any) =>
      cb(undefined, { status: CloudAuthStatus.Succeed }),
    )
    renderConfigOAuth()

    const afterCallbackActions = [
      setJob({
        id: '',
        name: CloudJobName.CreateFreeSubscriptionAndDatabase,
        status: '',
      }),
      showOAuthProgress(true),
      addInfiniteNotification(INFINITE_MESSAGES.AUTHENTICATING()),
      setSocialDialogState(null),
      addInfiniteNotification(
        INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Credentials),
      ),
    ]

    const expectedActions = [getPlans()]
    expect(store.getActions()).toEqual([
      ...afterCallbackActions,
      ...expectedActions,
    ])
  })

  it('should call fetch subscriptions with autodiscovery flow', () => {
    ;(cloudSelector as jest.Mock).mockReturnValue({
      ssoFlow: 'import',
    })

    const fetchUserInfoMock = jest
      .fn()
      .mockImplementation(
        (onSuccessAction: () => void) => () => onSuccessAction(),
      )
    ;(fetchUserInfo as jest.Mock).mockImplementation(fetchUserInfoMock)

    window.app?.cloudOauthCallback.mockImplementation((cb: any) =>
      cb(undefined, { status: CloudAuthStatus.Succeed }),
    )
    renderConfigOAuth()

    const afterCallbackActions = [
      setJob({
        id: '',
        name: CloudJobName.CreateFreeSubscriptionAndDatabase,
        status: '',
      }),
      showOAuthProgress(true),
      addInfiniteNotification(INFINITE_MESSAGES.AUTHENTICATING()),
      setSocialDialogState(null),
      addInfiniteNotification(
        INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Credentials),
      ),
    ]

    const expectedActions = [loadSubscriptionsRedisCloud()]
    expect(store.getActions()).toEqual([
      ...afterCallbackActions,
      ...expectedActions,
    ])
  })

  it('should call create free job after success with recommended settings', () => {
    ;(cloudSelector as jest.Mock).mockReturnValue({
      isRecommendedSettings: true,
      ssoFlow: 'create',
    })

    const fetchUserInfoMock = jest
      .fn()
      .mockImplementation(
        (onSuccessAction: () => void) => () => onSuccessAction(),
      )
    ;(fetchUserInfo as jest.Mock).mockImplementation(fetchUserInfoMock)

    window.app?.cloudOauthCallback.mockImplementation((cb: any) =>
      cb(undefined, { status: CloudAuthStatus.Succeed }),
    )
    renderConfigOAuth()

    const afterCallbackActions = [
      setJob({
        id: '',
        name: CloudJobName.CreateFreeSubscriptionAndDatabase,
        status: '',
      }),
      showOAuthProgress(true),
      addInfiniteNotification(INFINITE_MESSAGES.AUTHENTICATING()),
      setSocialDialogState(null),
      addInfiniteNotification(
        INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Credentials),
      ),
    ]

    const expectedActions = [addFreeDb()]
    expect(store.getActions()).toEqual([
      ...afterCallbackActions,
      ...expectedActions,
    ])
  })
})
