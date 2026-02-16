import { cloneDeep } from 'lodash'

import { cleanup, mockedStore, renderHook, act } from 'uiSrc/utils/test-utils'
import { AzureLoginSource } from 'uiSrc/slices/interfaces'
import {
  azureAuthSelector,
  initiateAzureLoginAction,
} from 'uiSrc/slices/oauth/azure'
import { AzureAccountFactory } from 'uiSrc/mocks/factories/cloud/AzureAccount.factory'

import { useAzureAuth } from './useAzureAuth'

// Mock config to simulate Electron environment
jest.mock('uiSrc/config', () => ({
  getConfig: jest.fn().mockReturnValue({
    app: {
      type: 'ELECTRON',
      env: 'production',
    },
  }),
}))

jest.mock('uiSrc/slices/oauth/azure', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/azure'),
  azureAuthSelector: jest.fn().mockReturnValue({
    loading: false,
    account: null,
    error: '',
  }),
  initiateAzureLoginAction: jest.fn().mockReturnValue({ type: 'mock-action' }),
}))

const mockedAzureAuthSelector = azureAuthSelector as jest.Mock
const mockedInitiateAzureLoginAction = initiateAzureLoginAction as jest.Mock

let store: typeof mockedStore

const mockAccount = AzureAccountFactory.build()

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
  jest.clearAllMocks()
  mockedAzureAuthSelector.mockReturnValue({
    loading: false,
    account: null,
    error: '',
  })
})

describe('useAzureAuth', () => {
  it('should return loading, account, and error from selector', () => {
    mockedAzureAuthSelector.mockReturnValue({
      loading: true,
      account: mockAccount,
      error: 'test error',
    })

    const { result } = renderHook(() => useAzureAuth())

    expect(result.current.loading).toBe(true)
    expect(result.current.account).toEqual(mockAccount)
    expect(result.current.error).toBe('test error')
  })

  describe('initiateLogin', () => {
    it('should dispatch initiateAzureLoginAction with default source', () => {
      const { result } = renderHook(() => useAzureAuth())

      act(() => {
        result.current.initiateLogin()
      })

      expect(mockedInitiateAzureLoginAction).toHaveBeenCalledWith({
        source: AzureLoginSource.Autodiscovery,
        onSuccess: expect.any(Function),
      })
    })

    it('should dispatch initiateAzureLoginAction with provided source', () => {
      const { result } = renderHook(() => useAzureAuth())

      act(() => {
        result.current.initiateLogin(AzureLoginSource.TokenRefresh)
      })

      expect(mockedInitiateAzureLoginAction).toHaveBeenCalledWith({
        source: AzureLoginSource.TokenRefresh,
        onSuccess: expect.any(Function),
      })
    })
  })

  describe('switchAccount', () => {
    it('should dispatch initiateAzureLoginAction with select_account prompt', () => {
      const { result } = renderHook(() => useAzureAuth())

      act(() => {
        result.current.switchAccount()
      })

      expect(mockedInitiateAzureLoginAction).toHaveBeenCalledWith({
        source: AzureLoginSource.Autodiscovery,
        onSuccess: expect.any(Function),
        prompt: 'select_account',
      })
    })
  })
})
