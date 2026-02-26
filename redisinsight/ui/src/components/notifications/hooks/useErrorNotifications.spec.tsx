import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import { cleanup } from '@testing-library/react'

import { CustomErrorCodes } from 'uiSrc/constants'
import { riToast } from 'uiSrc/components/base/display/toast'
import { useErrorNotifications } from './useErrorNotifications'
import { initialStateDefault } from 'uiSrc/utils/test-utils'

jest.mock('uiSrc/components/base/display/toast', () => ({
  riToast: Object.assign(
    jest.fn(() => 'mock-toast-id'),
    {
      dismiss: jest.fn(),
      isActive: jest.fn(() => false),
      Variant: {
        Danger: 'danger',
        Informative: 'informative',
      },
    },
  ),
}))

const mockStore = configureStore()

const createWrapper =
  (store: ReturnType<typeof mockStore>) =>
  ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )

const createAzureError = (id: string) => ({
  id,
  name: 'Error',
  message: 'Azure Entra ID token expired',
  additionalInfo: {
    errorCode: CustomErrorCodes.AzureEntraIdTokenExpired,
  },
})

const createRegularError = (id: string, message: string) => ({
  id,
  name: 'Error',
  message,
})

const mockedRiToastIsActive = riToast.isActive as jest.Mock

describe('useErrorNotifications', () => {
  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
    mockedRiToastIsActive.mockReturnValue(false)
  })

  describe('Azure token expired errors', () => {
    it('should show only one toast for multiple Azure errors', () => {
      // Mock isActive to return true after the first toast is shown
      let toastShown = false
      mockedRiToastIsActive.mockImplementation(() => {
        const result = toastShown
        toastShown = true
        return result
      })

      const errors = [createAzureError('error-1'), createAzureError('error-2')]

      const store = mockStore({
        ...initialStateDefault,
        app: {
          ...initialStateDefault.app,
          notifications: {
            ...initialStateDefault.app.notifications,
            errors,
          },
        },
      })

      renderHook(() => useErrorNotifications(), {
        wrapper: createWrapper(store),
      })

      // Only one toast should be shown (first error shows, second skips)
      expect(riToast).toHaveBeenCalledTimes(1)
      expect(riToast).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          toastId: 'azure-token-expired',
        }),
      )
    })

    it('should not show duplicate toast if one is already active', () => {
      mockedRiToastIsActive.mockReturnValue(true)

      const errors = [createAzureError('error-1')]

      const store = mockStore({
        ...initialStateDefault,
        app: {
          ...initialStateDefault.app,
          notifications: {
            ...initialStateDefault.app.notifications,
            errors,
          },
        },
      })

      renderHook(() => useErrorNotifications(), {
        wrapper: createWrapper(store),
      })

      // Toast is already active, so riToast should not be called
      expect(riToast).not.toHaveBeenCalled()
    })

    it('should remove all Azure error IDs from Redux when toast is dismissed', () => {
      const errors = [createAzureError('error-1'), createAzureError('error-2')]

      const store = mockStore({
        ...initialStateDefault,
        app: {
          ...initialStateDefault.app,
          notifications: {
            ...initialStateDefault.app.notifications,
            errors,
          },
        },
      })

      renderHook(() => useErrorNotifications(), {
        wrapper: createWrapper(store),
      })

      // Get the onClose callback passed to the toast
      const mockRiToast = riToast as unknown as jest.Mock
      const toastCall = mockRiToast.mock.calls[0]
      const toastConfig = toastCall[0]
      const onClose = toastConfig.onClose

      // Call the onClose callback (simulating user closing the toast)
      onClose()

      // Should dispatch removeMessage for both error IDs
      const actions = store.getActions()
      expect(actions).toContainEqual({
        type: 'notifications/removeMessage',
        payload: 'error-1',
      })
      expect(actions).toContainEqual({
        type: 'notifications/removeMessage',
        payload: 'error-2',
      })

      // Should dismiss the toast
      expect(riToast.dismiss).toHaveBeenCalledWith('azure-token-expired')
    })
  })

  describe('regular errors', () => {
    it('should show toast for regular errors', () => {
      const errors = [createRegularError('error-1', 'Something went wrong')]

      const store = mockStore({
        ...initialStateDefault,
        app: {
          ...initialStateDefault.app,
          notifications: {
            ...initialStateDefault.app.notifications,
            errors,
          },
        },
      })

      renderHook(() => useErrorNotifications(), {
        wrapper: createWrapper(store),
      })

      expect(riToast).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          toastId: 'error-1',
          variant: 'danger',
        }),
      )
    })
  })
})
