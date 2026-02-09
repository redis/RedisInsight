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
  fetchDatabasesAzure,
  clearDatabasesAzure,
} from 'uiSrc/slices/instances/azure'
import { azureAuthAccountSelector } from 'uiSrc/slices/oauth/azure'
import { AzureRedisDatabase, AzureRedisType } from 'uiSrc/slices/interfaces'

import AzureDatabasesPage from './AzureDatabasesPage'

jest.mock('uiSrc/slices/instances/azure', () => ({
  ...jest.requireActual('uiSrc/slices/instances/azure'),
  azureSelector: jest.fn(),
  fetchDatabasesAzure: jest
    .fn()
    .mockReturnValue({ type: 'fetchDatabasesAzure' }),
  clearDatabasesAzure: jest
    .fn()
    .mockReturnValue({ type: 'clearDatabasesAzure' }),
}))

jest.mock('uiSrc/slices/oauth/azure', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/azure'),
  azureAuthAccountSelector: jest.fn(),
}))

const mockDatabase = (): AzureRedisDatabase => ({
  id: faker.string.uuid(),
  name: faker.internet.domainWord(),
  host: faker.internet.domainName(),
  port: 6379,
  type: AzureRedisType.Standard,
  location: faker.location.city(),
  provisioningState: 'Succeeded',
  resourceGroup: faker.string.alphanumeric(10),
  subscriptionId: faker.string.uuid(),
})

const mockSubscription = {
  subscriptionId: faker.string.uuid(),
  displayName: 'Test Subscription',
  state: 'Enabled',
}

const mockAccount = {
  id: faker.string.uuid(),
  username: faker.internet.email(),
  name: faker.person.fullName(),
}

const defaultAzureState = {
  loading: false,
  error: '',
  subscriptions: [mockSubscription],
  selectedSubscription: mockSubscription,
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
const mockedFetchDatabasesAzure = fetchDatabasesAzure as jest.Mock

describe('AzureDatabasesPage', () => {
  beforeEach(() => {
    cleanup()
    store = cloneDeep(mockedStore)
    store.clearActions()
    mockedAzureSelector.mockReturnValue(defaultAzureState)
    mockedAzureAuthAccountSelector.mockReturnValue(mockAccount)
    mockedFetchDatabasesAzure.mockClear()
  })

  it('should render', () => {
    expect(render(<AzureDatabasesPage />, { store })).toBeTruthy()
  })

  it('should redirect to subscriptions page when no subscription is selected', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })
    mockedAzureSelector.mockReturnValue({
      ...defaultAzureState,
      selectedSubscription: null,
    })

    render(<AzureDatabasesPage />, { store })

    expect(pushMock).toHaveBeenCalledWith(Pages.azureSubscriptions)
  })

  it('should fetch databases on mount when not already loaded', () => {
    render(<AzureDatabasesPage />, { store })

    expect(fetchDatabasesAzure).toHaveBeenCalledWith(
      mockAccount.id,
      mockSubscription.subscriptionId,
    )
  })

  it('should not fetch databases when already loaded', () => {
    mockedAzureSelector.mockReturnValue({
      ...defaultAzureState,
      loaded: { ...defaultAzureState.loaded, databases: true },
    })

    render(<AzureDatabasesPage />, { store })

    expect(fetchDatabasesAzure).not.toHaveBeenCalled()
  })

  it('should navigate to home when cancel is clicked', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    const databases = [mockDatabase()]
    mockedAzureSelector.mockReturnValue({
      ...defaultAzureState,
      databases,
      loaded: { ...defaultAzureState.loaded, databases: true },
    })

    render(<AzureDatabasesPage />, { store })

    fireEvent.click(screen.getByText('Cancel'))

    expect(pushMock).toHaveBeenCalledWith(Pages.home)
  })

  it('should navigate to subscriptions when back is clicked', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    const databases = [mockDatabase()]
    mockedAzureSelector.mockReturnValue({
      ...defaultAzureState,
      databases,
      loaded: { ...defaultAzureState.loaded, databases: true },
    })

    render(<AzureDatabasesPage />, { store })

    fireEvent.click(screen.getByTestId('btn-back-adding'))

    expect(pushMock).toHaveBeenCalledWith(Pages.azureSubscriptions)
  })

  describe('refresh functionality', () => {
    it('should clear and refetch databases when refresh is clicked', () => {
      const databases = [mockDatabase()]
      mockedAzureSelector.mockReturnValue({
        ...defaultAzureState,
        databases,
        loaded: { ...defaultAzureState.loaded, databases: true },
      })

      render(<AzureDatabasesPage />, { store })

      fireEvent.click(screen.getByTestId('btn-refresh-databases'))

      expect(clearDatabasesAzure).toHaveBeenCalled()
      expect(fetchDatabasesAzure).toHaveBeenCalledWith(
        mockAccount.id,
        mockSubscription.subscriptionId,
      )
    })
  })
})
