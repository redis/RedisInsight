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
import {
  addErrorNotification,
  addMessageNotification,
} from 'uiSrc/slices/app/notifications'
import successMessages from 'uiSrc/components/notifications/success-messages'

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
  const mockAccount = {
    id: faker.string.uuid(),
    username: faker.internet.email(),
    name: faker.person.fullName(),
  }

  it('should call proper actions on success', () => {
    window.app?.azureOauthCallback?.mockImplementation((cb: any) =>
      cb(undefined, { status: AzureAuthStatus.Succeed, account: mockAccount }),
    )
    renderConfigAzureAuth()

    const expectedActions = [
      azureOAuthCallbackSuccess(mockAccount),
      addMessageNotification(
        successMessages.AZURE_AUTH_SUCCESS(mockAccount.username),
      ),
    ]
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

  it('should not dispatch any actions for unknown status', () => {
    window.app?.azureOauthCallback?.mockImplementation((cb: any) =>
      cb(undefined, { status: 'unknown' }),
    )
    renderConfigAzureAuth()

    expect(store.getActions()).toEqual([])
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
