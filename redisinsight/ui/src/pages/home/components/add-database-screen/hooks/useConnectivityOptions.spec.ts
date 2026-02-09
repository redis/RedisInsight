import { cloneDeep } from 'lodash'
import reactRouterDom from 'react-router-dom'

import { cleanup, mockedStore, renderHook } from 'uiSrc/utils/test-utils'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { useAzureAuth } from 'uiSrc/components/hooks/useAzureAuth'
import { AddDbType } from 'uiSrc/pages/home/constants'
import { FeatureFlags, Pages } from 'uiSrc/constants'

import { useConnectivityOptions } from './useConnectivityOptions'
import { CONNECTIVITY_OPTIONS_CONFIG } from '../constants'

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({}),
}))

jest.mock('uiSrc/components/hooks/useAzureAuth', () => ({
  useAzureAuth: jest.fn().mockReturnValue({
    initiateLogin: jest.fn(),
    loading: false,
    account: null,
  }),
}))

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
  jest.clearAllMocks()
})

const mockedAppFeatureFlagsFeaturesSelector =
  appFeatureFlagsFeaturesSelector as jest.Mock
const mockedUseAzureAuth = useAzureAuth as jest.Mock

describe('useConnectivityOptions', () => {
  const mockOnClickOption = jest.fn()
  const mockInitiateLogin = jest.fn()

  beforeEach(() => {
    mockedUseAzureAuth.mockReturnValue({
      initiateLogin: mockInitiateLogin,
      loading: false,
      account: null,
    })
  })

  it('should return options without Azure when feature flag is disabled', () => {
    mockedAppFeatureFlagsFeaturesSelector.mockReturnValue({
      [FeatureFlags.azureEntraId]: { flag: false },
    })

    const { result } = renderHook(() =>
      useConnectivityOptions({ onClickOption: mockOnClickOption }),
    )

    const options = result.current
    const azureOption = options.find((opt) => opt.type === AddDbType.azure)

    expect(azureOption).toBeUndefined()
  })

  it('should return options with Azure when feature flag is enabled', () => {
    mockedAppFeatureFlagsFeaturesSelector.mockReturnValue({
      [FeatureFlags.azureEntraId]: { flag: true },
    })

    const { result } = renderHook(() =>
      useConnectivityOptions({ onClickOption: mockOnClickOption }),
    )

    const options = result.current
    const azureOption = options.find((opt) => opt.type === AddDbType.azure)

    expect(azureOption).toBeDefined()
    expect(azureOption?.title).toBe('Azure Managed Redis')
  })

  it('should use initiateLogin for Azure option onClick when not logged in', () => {
    const mockHistoryPush = jest.fn()
    reactRouterDom.useHistory = jest
      .fn()
      .mockReturnValue({ push: mockHistoryPush })

    mockedAppFeatureFlagsFeaturesSelector.mockReturnValue({
      [FeatureFlags.azureEntraId]: { flag: true },
    })
    mockedUseAzureAuth.mockReturnValue({
      initiateLogin: mockInitiateLogin,
      loading: false,
      account: null,
    })

    const { result } = renderHook(() =>
      useConnectivityOptions({ onClickOption: mockOnClickOption }),
    )

    const azureOption = result.current.find(
      (opt) => opt.type === AddDbType.azure,
    )

    azureOption?.onClick()

    expect(mockInitiateLogin).toHaveBeenCalled()
    expect(mockHistoryPush).not.toHaveBeenCalled()
    expect(mockOnClickOption).not.toHaveBeenCalled()
  })

  it('should navigate to Azure subscriptions page when already logged in', () => {
    const mockHistoryPush = jest.fn()
    reactRouterDom.useHistory = jest
      .fn()
      .mockReturnValue({ push: mockHistoryPush })

    const mockAccount = { id: 'test-id', username: 'test@example.com' }
    mockedAppFeatureFlagsFeaturesSelector.mockReturnValue({
      [FeatureFlags.azureEntraId]: { flag: true },
    })
    mockedUseAzureAuth.mockReturnValue({
      initiateLogin: mockInitiateLogin,
      loading: false,
      account: mockAccount,
    })

    const { result } = renderHook(() =>
      useConnectivityOptions({ onClickOption: mockOnClickOption }),
    )

    const azureOption = result.current.find(
      (opt) => opt.type === AddDbType.azure,
    )

    azureOption?.onClick()

    expect(mockHistoryPush).toHaveBeenCalledWith(Pages.azureSubscriptions)
    expect(mockInitiateLogin).not.toHaveBeenCalled()
    expect(mockOnClickOption).not.toHaveBeenCalled()
  })

  it('should use onClickOption for non-Azure options', () => {
    mockedAppFeatureFlagsFeaturesSelector.mockReturnValue({})

    const { result } = renderHook(() =>
      useConnectivityOptions({ onClickOption: mockOnClickOption }),
    )

    const sentinelOption = result.current.find(
      (opt) => opt.type === AddDbType.sentinel,
    )

    sentinelOption?.onClick()

    expect(mockOnClickOption).toHaveBeenCalledWith(AddDbType.sentinel)
    expect(mockInitiateLogin).not.toHaveBeenCalled()
  })

  it('should return Azure loading state from useAzureAuth', () => {
    mockedAppFeatureFlagsFeaturesSelector.mockReturnValue({
      [FeatureFlags.azureEntraId]: { flag: true },
    })
    mockedUseAzureAuth.mockReturnValue({
      initiateLogin: mockInitiateLogin,
      loading: true,
    })

    const { result } = renderHook(() =>
      useConnectivityOptions({ onClickOption: mockOnClickOption }),
    )

    const azureOption = result.current.find(
      (opt) => opt.type === AddDbType.azure,
    )

    expect(azureOption?.loading).toBe(true)
  })

  it('should return loading = false for non-Azure options', () => {
    mockedAppFeatureFlagsFeaturesSelector.mockReturnValue({})

    const { result } = renderHook(() =>
      useConnectivityOptions({ onClickOption: mockOnClickOption }),
    )

    const nonAzureOptions = result.current.filter(
      (opt) => opt.type !== AddDbType.azure,
    )

    nonAzureOptions.forEach((option) => {
      expect(option.loading).toBe(false)
    })
  })

  it('should include options without feature flags', () => {
    mockedAppFeatureFlagsFeaturesSelector.mockReturnValue({})

    const { result } = renderHook(() =>
      useConnectivityOptions({ onClickOption: mockOnClickOption }),
    )

    const optionsWithoutFeatureFlags = CONNECTIVITY_OPTIONS_CONFIG.filter(
      (opt) => !opt.featureFlag,
    )

    expect(result.current.length).toBe(optionsWithoutFeatureFlags.length)
  })
})
