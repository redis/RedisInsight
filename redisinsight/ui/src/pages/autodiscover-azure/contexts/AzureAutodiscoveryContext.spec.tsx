import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { faker } from '@faker-js/faker'

import { createMockedStore, mockedStore } from 'uiSrc/utils/test-utils'
import { apiService } from 'uiSrc/services'
import {
  AzureAutodiscoveryProvider,
  useAzureAutodiscovery,
} from './AzureAutodiscoveryContext'

jest.mock('uiSrc/slices/oauth/azure', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/azure'),
  azureAuthAccountSelector: jest.fn().mockReturnValue({
    id: 'test-account-id',
    username: 'test@example.com',
    name: 'Test User',
  }),
}))

jest.mock('uiSrc/services', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
  },
}))

const mockApiService = apiService as jest.Mocked<typeof apiService>

describe('AzureAutodiscoveryContext', () => {
  let store: typeof mockedStore

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <AzureAutodiscoveryProvider>{children}</AzureAutodiscoveryProvider>
    </Provider>
  )

  beforeEach(() => {
    store = createMockedStore()
    jest.clearAllMocks()
  })

  describe('useAzureAutodiscovery', () => {
    it('should throw error when used outside provider', () => {
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      expect(() => {
        renderHook(() => useAzureAutodiscovery())
      }).toThrow(
        'useAzureAutodiscovery must be used within an AzureAutodiscoveryProvider',
      )

      consoleError.mockRestore()
    })

    it('should return initial state', () => {
      const { result } = renderHook(() => useAzureAutodiscovery(), { wrapper })

      expect(result.current.subscriptionsLoading).toBe(true)
      expect(result.current.subscriptionsError).toBe('')
      expect(result.current.subscriptions).toEqual([])
      expect(result.current.selectedSubscription).toBeNull()
      expect(result.current.databasesLoading).toBe(false)
      expect(result.current.databasesError).toBe('')
      expect(result.current.databases).toEqual([])
      expect(result.current.selectedDatabases).toEqual([])
      expect(result.current.addedDatabases).toEqual([])
    })
  })

  describe('fetchSubscriptions', () => {
    it('should fetch subscriptions successfully', async () => {
      const mockSubscriptions = [
        {
          subscriptionId: faker.string.uuid(),
          displayName: faker.company.name(),
          state: 'Enabled',
          tenantId: faker.string.uuid(),
        },
      ]

      mockApiService.get.mockResolvedValueOnce({
        data: mockSubscriptions,
        status: 200,
      })

      const { result } = renderHook(() => useAzureAutodiscovery(), { wrapper })

      await act(async () => {
        await result.current.fetchSubscriptions()
      })

      await waitFor(() => {
        expect(result.current.subscriptionsLoading).toBe(false)
        expect(result.current.subscriptions).toEqual(mockSubscriptions)
      })
    })

    it('should handle fetch subscriptions error', async () => {
      mockApiService.get.mockRejectedValueOnce({
        response: { data: { message: 'Failed to fetch' } },
      })

      const { result } = renderHook(() => useAzureAutodiscovery(), { wrapper })

      await act(async () => {
        await result.current.fetchSubscriptions()
      })

      await waitFor(() => {
        expect(result.current.subscriptionsLoading).toBe(false)
        expect(result.current.subscriptionsError).toBe('Failed to fetch')
      })
    })
  })

  describe('selectSubscription', () => {
    it('should select subscription and reset databases', () => {
      const subscription = {
        subscriptionId: faker.string.uuid(),
        displayName: faker.company.name(),
        state: 'Enabled',
        tenantId: faker.string.uuid(),
      }

      const { result } = renderHook(() => useAzureAutodiscovery(), { wrapper })

      act(() => {
        result.current.selectSubscription(subscription)
      })

      expect(result.current.selectedSubscription).toEqual(subscription)
      expect(result.current.databases).toEqual([])
      expect(result.current.selectedDatabases).toEqual([])
    })
  })

  describe('setSelectedDatabases', () => {
    it('should set selected databases', () => {
      const databases = [
        {
          id: faker.string.uuid(),
          name: faker.internet.domainWord(),
          host: faker.internet.domainName(),
          port: 6379,
          type: 'redis',
          location: faker.location.city(),
          provisioningState: 'Succeeded',
          resourceGroup: faker.string.alphanumeric(10),
          subscriptionId: faker.string.uuid(),
        },
      ]

      const { result } = renderHook(() => useAzureAutodiscovery(), { wrapper })

      act(() => {
        result.current.setSelectedDatabases(databases)
      })

      expect(result.current.selectedDatabases).toEqual(databases)
    })
  })

  describe('addDatabases', () => {
    const createMockDatabase = () => ({
      id: faker.string.uuid(),
      name: faker.internet.domainWord(),
      host: faker.internet.domainName(),
      port: 6379,
      type: 'standard',
      location: faker.location.city(),
      provisioningState: 'Succeeded',
      resourceGroup: faker.string.alphanumeric(10),
      subscriptionId: faker.string.uuid(),
    })

    it('should return empty array when no databases selected', async () => {
      const { result } = renderHook(() => useAzureAutodiscovery(), { wrapper })

      let results: unknown[] = []
      await act(async () => {
        results = await result.current.addDatabases()
      })

      expect(results).toEqual([])
    })

    it('should add databases successfully', async () => {
      const mockDatabase = createMockDatabase()

      mockApiService.post.mockResolvedValueOnce({
        data: [{ id: mockDatabase.id, status: 'success', message: 'Added' }],
        status: 201,
      })

      const { result } = renderHook(() => useAzureAutodiscovery(), { wrapper })

      act(() => {
        result.current.setSelectedDatabases([mockDatabase])
      })

      let results: unknown[] = []
      await act(async () => {
        results = await result.current.addDatabases()
      })

      await waitFor(() => {
        expect(results).toHaveLength(1)
        expect(result.current.addedDatabases).toHaveLength(1)
        expect(result.current.addedDatabases[0].success).toBe(true)
      })
    })

    it('should handle failed database additions', async () => {
      const mockDatabase = createMockDatabase()

      mockApiService.post.mockResolvedValueOnce({
        data: [
          { id: mockDatabase.id, status: 'fail', message: 'Connection failed' },
        ],
        status: 200,
      })

      const { result } = renderHook(() => useAzureAutodiscovery(), { wrapper })

      act(() => {
        result.current.setSelectedDatabases([mockDatabase])
      })

      let results: unknown[] = []
      await act(async () => {
        results = await result.current.addDatabases()
      })

      await waitFor(() => {
        expect(results).toHaveLength(1)
        expect(result.current.addedDatabases[0].success).toBe(false)
      })
    })

    it('should handle API error', async () => {
      const mockDatabase = createMockDatabase()

      mockApiService.post.mockRejectedValueOnce({
        response: { data: { message: 'API Error' } },
      })

      const { result } = renderHook(() => useAzureAutodiscovery(), { wrapper })

      act(() => {
        result.current.setSelectedDatabases([mockDatabase])
      })

      await act(async () => {
        await result.current.addDatabases()
      })

      await waitFor(() => {
        expect(result.current.databasesError).toBe('API Error')
      })
    })
  })
})
