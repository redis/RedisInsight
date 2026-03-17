import React from 'react'
import { faker } from '@faker-js/faker'

import {
  cleanup,
  mockedStore,
  render,
  createMockedStore,
  act,
} from 'uiSrc/utils/test-utils'
import { AzureAuthStatus } from 'apiSrc/modules/azure/constants'
import {
  azureOAuthCallbackSuccess,
  azureOAuthCallbackFailure,
  setAzureLoginSource,
} from 'uiSrc/slices/oauth/azure'
import { resetDataAzure } from 'uiSrc/slices/instances/azure'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'

import GlobalAzureAuth from './GlobalAzureAuth'

// Mock config to simulate non-Electron environment
jest.mock('uiSrc/config', () => ({
  getConfig: jest.fn().mockReturnValue({
    app: {
      type: 'WEB',
      env: 'production',
    },
  }),
}))

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = createMockedStore()
  store.clearActions()
})

const renderGlobalAzureAuth = () => render(<GlobalAzureAuth />, { store })

describe('GlobalAzureAuth', () => {
  it('should render without crashing', () => {
    const { container } = renderGlobalAzureAuth()
    // GlobalAzureAuth returns null, so container should be empty
    expect(container.firstChild).toBeNull()
  })

  it('should set up message listener on mount', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener')

    renderGlobalAzureAuth()

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'message',
      expect.any(Function),
    )

    addEventListenerSpy.mockRestore()
  })

  it('should clean up message listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')

    const { unmount } = renderGlobalAzureAuth()
    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'message',
      expect.any(Function),
    )

    removeEventListenerSpy.mockRestore()
  })

  describe('postMessage handling', () => {
    const mockMsalAccount = {
      id: faker.string.uuid(),
      username: faker.internet.email(),
      name: faker.person.fullName(),
    }

    it('should dispatch success actions on valid success message', () => {
      renderGlobalAzureAuth()

      act(() => {
        window.dispatchEvent(
          new MessageEvent('message', {
            data: {
              type: 'azure-oauth-callback',
              payload: {
                status: AzureAuthStatus.Succeed,
                account: mockMsalAccount,
              },
            },
            origin: window.location.origin,
          }),
        )
      })

      const actions = store.getActions()
      expect(actions).toContainEqual(resetDataAzure())
      expect(actions).toContainEqual(azureOAuthCallbackSuccess(mockMsalAccount))
      expect(actions).toContainEqual(setAzureLoginSource(null))
    })

    it('should dispatch failure actions on failure message', () => {
      const errorMessage = faker.lorem.sentence()

      renderGlobalAzureAuth()

      act(() => {
        window.dispatchEvent(
          new MessageEvent('message', {
            data: {
              type: 'azure-oauth-callback',
              payload: {
                status: AzureAuthStatus.Failed,
                error: errorMessage,
              },
            },
            origin: window.location.origin,
          }),
        )
      })

      const actions = store.getActions()
      expect(actions).toContainEqual(azureOAuthCallbackFailure(errorMessage))
      expect(actions[1].type).toEqual(addErrorNotification({} as any).type)
    })

    it('should ignore messages with wrong type', () => {
      renderGlobalAzureAuth()

      act(() => {
        window.dispatchEvent(
          new MessageEvent('message', {
            data: {
              type: 'some-other-type',
              payload: {},
            },
            origin: window.location.origin,
          }),
        )
      })

      const actions = store.getActions()
      expect(actions.length).toBe(0)
    })
  })

  describe('localStorage polling setup', () => {
    it('should set up interval on mount', () => {
      const setIntervalSpy = jest.spyOn(window, 'setInterval')

      renderGlobalAzureAuth()

      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 500)

      setIntervalSpy.mockRestore()
    })

    it('should clean up interval on unmount', () => {
      const clearIntervalSpy = jest.spyOn(window, 'clearInterval')

      const { unmount } = renderGlobalAzureAuth()
      unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()

      clearIntervalSpy.mockRestore()
    })
  })
})
