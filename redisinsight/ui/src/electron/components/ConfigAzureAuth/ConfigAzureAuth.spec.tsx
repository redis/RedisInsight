import React from 'react'
import { faker } from '@faker-js/faker'

import {
  cleanup,
  mockedStore,
  render,
  createMockedStore,
  mockStore,
  initialStateDefault,
} from 'uiSrc/utils/test-utils'
import { AzureAuthStatus } from 'apiSrc/modules/azure/constants'
import {
  azureOAuthCallbackSuccess,
  azureOAuthCallbackFailure,
  setAzureLoginSource,
} from 'uiSrc/slices/oauth/azure'
import { resetDataAzure } from 'uiSrc/slices/instances/azure'
import { AzureLoginSource } from 'uiSrc/slices/interfaces'
import {
  addErrorNotification,
  addMessageNotification,
} from 'uiSrc/slices/app/notifications'

import ConfigAzureAuth from './ConfigAzureAuth'

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = createMockedStore()
  store.clearActions()
  window.app = {
    azureOauthCallback: jest.fn(),
  } as any
})

afterEach(() => {
  delete (window as any).app
})

const renderConfigAzureAuth = () => render(<ConfigAzureAuth />, { store })

describe('ConfigAzureAuth', () => {
  const mockMsalAccount = {
    homeAccountId: faker.string.uuid(),
    username: faker.internet.email(),
    name: faker.person.fullName(),
  }

  const expectedAccount = {
    id: mockMsalAccount.homeAccountId,
    username: mockMsalAccount.username,
    name: mockMsalAccount.name,
  }

  it('should call proper actions on success', () => {
    window.app?.azureOauthCallback?.mockImplementation((cb: any) =>
      cb(undefined, {
        status: AzureAuthStatus.Succeed,
        account: mockMsalAccount,
      }),
    )
    renderConfigAzureAuth()

    const expectedActions = [
      resetDataAzure(),
      azureOAuthCallbackSuccess(expectedAccount),
    ]
    expect(store.getActions()).toEqual(expectedActions)
    const actions = store.getActions()
    expect(actions[0]).toEqual(azureOAuthCallbackSuccess(expectedAccount))
    expect(actions[1]).toEqual(setAzureLoginSource(null))
  })

  it('should call proper actions on failure with error message', () => {
    const errorMessage = faker.lorem.sentence()

    window.app?.azureOauthCallback?.mockImplementation((cb: any) =>
      cb(undefined, { status: AzureAuthStatus.Failed, error: errorMessage }),
    )
    renderConfigAzureAuth()

    const actions = store.getActions()

    expect(actions[0]).toEqual(azureOAuthCallbackFailure(errorMessage))
    expect(actions[1].type).toEqual(addErrorNotification({} as any).type)
  })

  it('should call proper actions on failure with default error message', () => {
    window.app?.azureOauthCallback?.mockImplementation((cb: any) =>
      cb(undefined, { status: AzureAuthStatus.Failed }),
    )
    renderConfigAzureAuth()

    const actions = store.getActions()

    expect(actions[0]).toEqual(
      azureOAuthCallbackFailure('Azure authentication failed'),
    )
    expect(actions[1].type).toEqual(addErrorNotification({} as any).type)
  })

  it('should call failure actions for unknown status', () => {
    window.app?.azureOauthCallback?.mockImplementation((cb: any) =>
      cb(undefined, { status: 'unknown' }),
    )
    renderConfigAzureAuth()

    const actions = store.getActions()

    expect(actions[0]).toEqual(
      azureOAuthCallbackFailure('Azure authentication failed'),
    )
    expect(actions[1].type).toEqual(addErrorNotification({} as any).type)
  })

  it('should call failure actions when success status but account is missing', () => {
    window.app?.azureOauthCallback?.mockImplementation((cb: any) =>
      cb(undefined, { status: AzureAuthStatus.Succeed, account: undefined }),
    )
    renderConfigAzureAuth()

    const actions = store.getActions()

    expect(actions[0]).toEqual(
      azureOAuthCallbackFailure('Azure authentication failed'),
    )
    expect(actions[1].type).toEqual(addErrorNotification({} as any).type)
  })

  it('should show success notification when source is token-refresh', () => {
    const stateWithTokenRefresh = {
      ...initialStateDefault,
      oauth: {
        ...initialStateDefault.oauth,
        azure: {
          loading: false,
          account: null,
          error: '',
          source: AzureLoginSource.TokenRefresh,
        },
      },
    }
    store = mockStore(stateWithTokenRefresh)
    store.clearActions()

    window.app?.azureOauthCallback?.mockImplementation((cb: any) =>
      cb(undefined, {
        status: AzureAuthStatus.Succeed,
        account: mockMsalAccount,
      }),
    )
    render(<ConfigAzureAuth />, { store })

    const actions = store.getActions()
    expect(actions[0]).toEqual(azureOAuthCallbackSuccess(expectedAccount))
    expect(actions[1]).toEqual(setAzureLoginSource(null))
    expect(actions[2].type).toEqual(addMessageNotification({} as any).type)
  })

  it('should not show success notification when source is autodiscovery', () => {
    const stateWithAutodiscovery = {
      ...initialStateDefault,
      oauth: {
        ...initialStateDefault.oauth,
        azure: {
          loading: false,
          account: null,
          error: '',
          source: AzureLoginSource.Autodiscovery,
        },
      },
    }
    store = mockStore(stateWithAutodiscovery)
    store.clearActions()

    window.app?.azureOauthCallback?.mockImplementation((cb: any) =>
      cb(undefined, {
        status: AzureAuthStatus.Succeed,
        account: mockMsalAccount,
      }),
    )
    render(<ConfigAzureAuth />, { store })

    const actions = store.getActions()
    expect(actions[0]).toEqual(azureOAuthCallbackSuccess(expectedAccount))
    expect(actions[1]).toEqual(setAzureLoginSource(null))
    // No message notification should be dispatched
    expect(actions.length).toBe(2)
  })
})
