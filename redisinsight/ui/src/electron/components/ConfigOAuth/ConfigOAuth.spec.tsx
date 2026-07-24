import React from 'react'
import {
  act,
  cleanup,
  createMockedStore,
  fireEvent,
  mockedStore,
  render,
  screen,
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
  oauthCloudMfaSelector,
  setJob,
  setOAuthCloudSource,
  setSocialDialogState,
  showOAuthProgress,
  signInFailure,
  submitMfaCode,
  submitMfaCodeSuccess,
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
import { apiService } from 'uiSrc/services'
import ConfigOAuth from './ConfigOAuth'

jest.mock('uiSrc/slices/oauth/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/cloud'),
  fetchUserInfo: jest
    .fn()
    .mockImplementation(
      jest.requireActual('uiSrc/slices/oauth/cloud').fetchUserInfo,
    ),
  oauthCloudMfaSelector: jest.fn().mockReturnValue({
    isOpenDialog: false,
    loading: false,
    error: '',
  }),
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

  it('should resume the sign in flow after mfa verification', async () => {
    ;(cloudSelector as jest.Mock).mockReturnValue({
      ssoFlow: 'signIn',
    })
    ;(fetchUserInfo as jest.Mock).mockImplementation(
      jest.requireActual('uiSrc/slices/oauth/cloud').fetchUserInfo,
    )
    ;(oauthCloudMfaSelector as jest.Mock).mockReturnValue({
      isOpenDialog: true,
      loading: false,
      error: '',
    })
    apiService.post = jest.fn().mockResolvedValue({ status: 200 })
    apiService.get = jest.fn().mockResolvedValue({ status: 200, data: {} })

    renderConfigOAuth()

    // pasting the full code auto-submits and completes the pending login
    await act(async () => {
      fireEvent.paste(screen.getByTestId('oauth-mfa-dialog-code-input-0'), {
        clipboardData: { getData: () => '123456' },
      })
    })

    const expectedActions = [
      submitMfaCode(),
      submitMfaCodeSuccess(),
      addInfiniteNotification(INFINITE_MESSAGES.AUTHENTICATING()),
      getUserInfo(),
    ]
    expect(store.getActions().slice(0, expectedActions.length)).toEqual(
      expectedActions,
    )
  })
})
