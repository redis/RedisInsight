import React from 'react'
import { faker } from '@faker-js/faker'

import {
  cleanup,
  mockedStore,
  render,
  createMockedStore,
  localStorageMock,
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

const AZURE_OAUTH_STORAGE_KEY = 'ri_azure_oauth_result'

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
  jest.clearAllMocks()
})

const renderGlobalAzureAuth = () => render(<GlobalAzureAuth />, { store })

describe('GlobalAzureAuth', () => {
  it('should render without crashing', () => {
    const { container } = renderGlobalAzureAuth()
    // GlobalAzureAuth returns null, so container should be empty
    expect(container.firstChild).toBeNull()
  })

  describe('localStorage polling', () => {
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

    it('should dispatch success actions when valid result found in localStorage', () => {
      const mockMsalAccount = {
        id: faker.string.uuid(),
        username: faker.internet.email(),
        name: faker.person.fullName(),
      }

      const storedValue = JSON.stringify({
        timestamp: Date.now(),
        result: {
          status: AzureAuthStatus.Succeed,
          account: mockMsalAccount,
        },
      })

      // Mock localStorage.getItem to return the stored value once, then null
      localStorageMock.getItem.mockReturnValueOnce(storedValue)

      renderGlobalAzureAuth()

      const actions = store.getActions()
      expect(actions).toContainEqual(resetDataAzure())
      expect(actions).toContainEqual(azureOAuthCallbackSuccess(mockMsalAccount))
      expect(actions).toContainEqual(setAzureLoginSource(null))

      // Verify localStorage.removeItem was called
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        AZURE_OAUTH_STORAGE_KEY,
      )
    })

    it('should dispatch failure actions when error result found in localStorage', () => {
      const errorMessage = faker.lorem.sentence()

      const storedValue = JSON.stringify({
        timestamp: Date.now(),
        result: {
          status: AzureAuthStatus.Failed,
          error: errorMessage,
        },
      })

      // Mock localStorage.getItem to return the stored value once
      localStorageMock.getItem.mockReturnValueOnce(storedValue)

      renderGlobalAzureAuth()

      const actions = store.getActions()
      // handleAzureOAuthFailure dispatches azureOAuthCallbackFailure first
      expect(actions).toContainEqual(azureOAuthCallbackFailure(errorMessage))
      // Then addErrorNotification is dispatched
      expect(
        actions.some(
          (a: { type: string }) =>
            a.type === addErrorNotification({} as any).type,
        ),
      ).toBe(true)

      // Verify localStorage.removeItem was called
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        AZURE_OAUTH_STORAGE_KEY,
      )
    })

    it('should ignore stale results in localStorage', () => {
      const mockMsalAccount = {
        id: faker.string.uuid(),
        username: faker.internet.email(),
        name: faker.person.fullName(),
      }

      const storedValue = JSON.stringify({
        timestamp: Date.now() - 60000, // 60 seconds ago (stale)
        result: {
          status: AzureAuthStatus.Succeed,
          account: mockMsalAccount,
        },
      })

      // Mock localStorage.getItem to return the stale value
      localStorageMock.getItem.mockReturnValueOnce(storedValue)

      renderGlobalAzureAuth()

      const actions = store.getActions()
      expect(actions.length).toBe(0)

      // Stale result should be cleared
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        AZURE_OAUTH_STORAGE_KEY,
      )
    })
  })
})
