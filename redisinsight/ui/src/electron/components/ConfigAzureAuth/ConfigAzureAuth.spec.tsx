import React from 'react'
import { faker } from '@faker-js/faker'

import {
  cleanup,
  mockedStore,
  render,
  createMockedStore,
} from 'uiSrc/utils/test-utils'
import { AzureAuthStatus } from 'apiSrc/modules/azure/constants'
import {
  azureOAuthCallbackSuccess,
  azureOAuthCallbackFailure,
} from 'uiSrc/slices/oauth/azure'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'

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

    const expectedActions = [azureOAuthCallbackSuccess(expectedAccount)]
    expect(store.getActions()).toEqual(expectedActions)
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
})
