import React from 'react'
import reactRouterDom from 'react-router-dom'
import { cloneDeep } from 'lodash'
import { faker } from '@faker-js/faker'
import {
  cleanup,
  mockedStore,
  render,
  fireEvent,
  screen,
} from 'uiSrc/utils/test-utils'
import { Pages } from 'uiSrc/constants'
import {
  azureSelector,
  fetchSubscriptionsAzure,
  clearSubscriptionsAzure,
} from 'uiSrc/slices/instances/azure'
import { useAzureAuth } from 'uiSrc/components/hooks/useAzureAuth'
import { azureAuthAccountSelector } from 'uiSrc/slices/oauth/azure'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { AzureAccountFactory } from 'uiSrc/mocks/factories/cloud/AzureAccount.factory'

import AzureSubscriptionsPage from './AzureSubscriptionsPage'

jest.mock('uiSrc/slices/instances/azure', () => ({
  ...jest.requireActual('uiSrc/slices/instances/azure'),
  azureSelector: jest.fn(),
  fetchSubscriptionsAzure: jest
    .fn()
    .mockReturnValue({ type: 'fetchSubscriptionsAzure' }),
  clearSubscriptionsAzure: jest
    .fn()
    .mockReturnValue({ type: 'clearSubscriptionsAzure' }),
}))

jest.mock('uiSrc/components/hooks/useAzureAuth', () => ({
  useAzureAuth: jest.fn(),
}))

jest.mock('uiSrc/slices/oauth/azure', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/azure'),
  azureAuthAccountSelector: jest.fn(),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const mockSubscription = {
  subscriptionId: faker.string.uuid(),
  displayName: 'Test Subscription',
  state: 'Enabled',
  tenantId: faker.string.uuid(),
}

const mockAccount = AzureAccountFactory.build()

const defaultAzureState = {
  loading: false,
  error: '',
  subscriptions: [mockSubscription],
  selectedSubscription: null,
  databases: [],
  databasesAdded: [],
  loaded: {
    subscriptions: true,
    databases: false,
    databasesAdded: false,
  },
}

let store: typeof mockedStore

const mockedAzureSelector = azureSelector as jest.Mock
const mockedAzureAuthAccountSelector = azureAuthAccountSelector as jest.Mock
const mockedUseAzureAuth = useAzureAuth as jest.Mock
const mockedSendEventTelemetry = sendEventTelemetry as jest.Mock

describe('AzureSubscriptionsPage', () => {
  const mockSwitchAccount = jest.fn()

  beforeEach(() => {
    cleanup()
    store = cloneDeep(mockedStore)
    store.clearActions()
    mockedAzureSelector.mockReturnValue(defaultAzureState)
    mockedAzureAuthAccountSelector.mockReturnValue(mockAccount)
    mockedUseAzureAuth.mockReturnValue({
      switchAccount: mockSwitchAccount,
      account: mockAccount,
      loading: false,
      error: '',
    })
    mockedSendEventTelemetry.mockClear()
    mockSwitchAccount.mockClear()
  })

  it('should redirect to home when not authenticated', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })
    mockedUseAzureAuth.mockReturnValue({
      switchAccount: mockSwitchAccount,
      account: null,
    })

    render(<AzureSubscriptionsPage />, { store })

    expect(pushMock).toHaveBeenCalledWith(Pages.home)
  })

  it('should fetch subscriptions on mount when not already loaded', () => {
    mockedAzureSelector.mockReturnValue({
      ...defaultAzureState,
      loaded: { ...defaultAzureState.loaded, subscriptions: false },
    })

    render(<AzureSubscriptionsPage />, { store })

    expect(fetchSubscriptionsAzure).toHaveBeenCalledWith(mockAccount.id)
  })

  describe('switch account', () => {
    it('should call switchAccount when switch account button is clicked', () => {
      render(<AzureSubscriptionsPage />, { store })

      fireEvent.click(screen.getByTestId('btn-switch-account'))

      expect(mockSwitchAccount).toHaveBeenCalledTimes(1)
    })

    it('should send telemetry when switch account is clicked', () => {
      render(<AzureSubscriptionsPage />, { store })

      fireEvent.click(screen.getByTestId('btn-switch-account'))

      expect(mockedSendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.AZURE_SWITCH_ACCOUNT_CLICKED,
      })
    })
  })

  describe('refresh', () => {
    it('should clear and refetch subscriptions when refresh is clicked', () => {
      render(<AzureSubscriptionsPage />, { store })

      fireEvent.click(screen.getByTestId('btn-refresh-subscriptions'))

      expect(clearSubscriptionsAzure).toHaveBeenCalled()
      expect(fetchSubscriptionsAzure).toHaveBeenCalledWith(mockAccount.id)
    })
  })
})
