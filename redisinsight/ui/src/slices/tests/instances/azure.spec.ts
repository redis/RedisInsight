import { cloneDeep } from 'lodash'
import { faker } from '@faker-js/faker'
import { apiService } from 'uiSrc/services'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import reducer, {
  initialState,
  azureSelector,
  loadSubscriptionsAzure,
  loadSubscriptionsAzureSuccess,
  loadSubscriptionsAzureFailure,
  setSelectedSubscriptionAzure,
  loadDatabasesAzure,
  loadDatabasesAzureSuccess,
  loadDatabasesAzureFailure,
  addDatabasesAzure,
  addDatabasesAzureSuccess,
  addDatabasesAzureFailure,
  resetDataAzure,
  clearSubscriptionsAzure,
  clearDatabasesAzure,
  fetchSubscriptionsAzure,
  fetchDatabasesAzure,
  addDatabasesAzureAction,
} from '../../instances/azure'
import {
  ActionStatus,
  AzureAccessKeysStatus,
  AzureRedisDatabase,
  AzureRedisType,
  AzureSubscription,
  LoadedAzure,
} from '../../interfaces'
import {
  addErrorNotification,
  IAddInstanceErrorPayload,
} from '../../app/notifications'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
}))

let store: typeof mockedStore
let subscriptions: AzureSubscription[]
let databases: AzureRedisDatabase[]

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()

  subscriptions = [
    {
      subscriptionId: faker.string.uuid(),
      displayName: faker.company.name(),
      state: 'Enabled',
    },
    {
      subscriptionId: faker.string.uuid(),
      displayName: faker.company.name(),
      state: 'Enabled',
    },
  ]

  databases = [
    {
      id: faker.string.uuid(),
      name: faker.internet.domainWord(),
      host: faker.internet.domainName(),
      port: 6379,
      location: 'eastus',
      type: AzureRedisType.Standard,
      accessKeysAuthentication: AzureAccessKeysStatus.Enabled,
      provisioningState: 'Succeeded',
      resourceGroup: faker.string.alphanumeric(10),
      subscriptionId: subscriptions[0].subscriptionId,
    },
    {
      id: faker.string.uuid(),
      name: faker.internet.domainWord(),
      host: faker.internet.domainName(),
      port: 6380,
      location: 'westus',
      type: AzureRedisType.Enterprise,
      accessKeysAuthentication: AzureAccessKeysStatus.Disabled,
      provisioningState: 'Succeeded',
      resourceGroup: faker.string.alphanumeric(10),
      subscriptionId: subscriptions[0].subscriptionId,
    },
  ]
})

describe('azure slice', () => {
  describe('reducer, actions and selectors', () => {
    it('should return the initial state on first run', () => {
      const nextState = initialState
      const result = reducer(undefined, { type: '' })
      expect(result).toEqual(nextState)
    })
  })

  describe('loadSubscriptionsAzure', () => {
    it('should properly set the state before the fetch data', () => {
      const state = {
        ...initialState,
        loading: true,
        error: '',
      }

      const nextState = reducer(initialState, loadSubscriptionsAzure())

      const rootState = Object.assign(initialStateDefault, {
        connections: { azure: nextState },
      })
      expect(azureSelector(rootState)).toEqual(state)
    })
  })

  describe('loadSubscriptionsAzureSuccess', () => {
    it('should properly set the state with fetched subscriptions', () => {
      const state = {
        ...initialState,
        loading: false,
        loaded: {
          ...initialState.loaded,
          [LoadedAzure.Subscriptions]: true,
        },
        subscriptions,
      }

      const nextState = reducer(
        initialState,
        loadSubscriptionsAzureSuccess(subscriptions),
      )

      const rootState = Object.assign(initialStateDefault, {
        connections: { azure: nextState },
      })
      expect(azureSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      const state = {
        ...initialState,
        loading: false,
        loaded: {
          ...initialState.loaded,
          [LoadedAzure.Subscriptions]: true,
        },
        subscriptions: [],
      }

      const nextState = reducer(initialState, loadSubscriptionsAzureSuccess([]))

      const rootState = Object.assign(initialStateDefault, {
        connections: { azure: nextState },
      })
      expect(azureSelector(rootState)).toEqual(state)
    })
  })

  describe('loadSubscriptionsAzureFailure', () => {
    it('should properly set the error', () => {
      const errorMessage = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: errorMessage,
      }

      const nextState = reducer(
        initialState,
        loadSubscriptionsAzureFailure(errorMessage),
      )

      const rootState = Object.assign(initialStateDefault, {
        connections: { azure: nextState },
      })
      expect(azureSelector(rootState)).toEqual(state)
    })
  })

  describe('setSelectedSubscriptionAzure', () => {
    it('should set selected subscription and reset databases when subscription changes', () => {
      const stateWithData = {
        ...initialState,
        databases,
        databasesAdded: databases,
        loaded: {
          ...initialState.loaded,
          [LoadedAzure.Databases]: true,
          [LoadedAzure.DatabasesAdded]: true,
        },
      }

      const nextState = reducer(
        stateWithData,
        setSelectedSubscriptionAzure(subscriptions[0]),
      )

      expect(nextState.selectedSubscription).toEqual(subscriptions[0])
      expect(nextState.databases).toBeNull()
      expect(nextState.databasesAdded).toEqual([])
      expect(nextState.loaded[LoadedAzure.Databases]).toBe(false)
      expect(nextState.loaded[LoadedAzure.DatabasesAdded]).toBe(false)
    })

    it('should not reset databases when same subscription is selected', () => {
      const stateWithData = {
        ...initialState,
        selectedSubscription: subscriptions[0],
        databases,
        databasesAdded: databases,
        loaded: {
          ...initialState.loaded,
          [LoadedAzure.Databases]: true,
          [LoadedAzure.DatabasesAdded]: true,
        },
      }

      const nextState = reducer(
        stateWithData,
        setSelectedSubscriptionAzure(subscriptions[0]),
      )

      expect(nextState.selectedSubscription).toEqual(subscriptions[0])
      expect(nextState.databases).toEqual(databases)
      expect(nextState.databasesAdded).toEqual(databases)
      expect(nextState.loaded[LoadedAzure.Databases]).toBe(true)
      expect(nextState.loaded[LoadedAzure.DatabasesAdded]).toBe(true)
    })
  })

  describe('loadDatabasesAzure', () => {
    it('should properly set the state before the fetch data', () => {
      const state = {
        ...initialState,
        loading: true,
        error: '',
      }

      const nextState = reducer(initialState, loadDatabasesAzure())

      const rootState = Object.assign(initialStateDefault, {
        connections: { azure: nextState },
      })
      expect(azureSelector(rootState)).toEqual(state)
    })
  })

  describe('loadDatabasesAzureSuccess', () => {
    it('should properly set the state with fetched databases', () => {
      const state = {
        ...initialState,
        loading: false,
        loaded: {
          ...initialState.loaded,
          [LoadedAzure.Databases]: true,
        },
        databases,
      }

      const nextState = reducer(
        initialState,
        loadDatabasesAzureSuccess(databases),
      )

      const rootState = Object.assign(initialStateDefault, {
        connections: { azure: nextState },
      })
      expect(azureSelector(rootState)).toEqual(state)
    })
  })

  describe('loadDatabasesAzureFailure', () => {
    it('should properly set the error', () => {
      const errorMessage = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: errorMessage,
      }

      const nextState = reducer(
        initialState,
        loadDatabasesAzureFailure(errorMessage),
      )

      const rootState = Object.assign(initialStateDefault, {
        connections: { azure: nextState },
      })
      expect(azureSelector(rootState)).toEqual(state)
    })
  })

  describe('addDatabasesAzure', () => {
    it('should properly set the state before adding databases', () => {
      const state = {
        ...initialState,
        loading: true,
        error: '',
      }

      const nextState = reducer(initialState, addDatabasesAzure())

      const rootState = Object.assign(initialStateDefault, {
        connections: { azure: nextState },
      })
      expect(azureSelector(rootState)).toEqual(state)
    })
  })

  describe('addDatabasesAzureSuccess', () => {
    it('should properly set the state with added databases', () => {
      const stateWithDatabases = {
        ...initialState,
        databases,
      }

      const addResults = [
        { id: databases[0].id, status: ActionStatus.Success, message: '' },
        {
          id: databases[1].id,
          status: ActionStatus.Fail,
          message: 'Connection failed',
        },
      ]

      const nextState = reducer(
        stateWithDatabases,
        addDatabasesAzureSuccess(addResults),
      )

      expect(nextState.loading).toBe(false)
      expect(nextState.loaded[LoadedAzure.DatabasesAdded]).toBe(true)
      expect(nextState.databasesAdded).toHaveLength(2)
      expect(nextState.databasesAdded[0].statusAdded).toBe(ActionStatus.Success)
      expect(nextState.databasesAdded[1].statusAdded).toBe(ActionStatus.Fail)
      expect(nextState.databasesAdded[1].messageAdded).toBe('Connection failed')
    })
  })

  describe('addDatabasesAzureFailure', () => {
    it('should properly set the error', () => {
      const errorMessage = 'Failed to add databases'
      const state = {
        ...initialState,
        loading: false,
        error: errorMessage,
      }

      const nextState = reducer(
        initialState,
        addDatabasesAzureFailure(errorMessage),
      )

      const rootState = Object.assign(initialStateDefault, {
        connections: { azure: nextState },
      })
      expect(azureSelector(rootState)).toEqual(state)
    })
  })

  describe('resetDataAzure', () => {
    it('should reset state to initial state', () => {
      const stateWithData = {
        ...initialState,
        loading: true,
        error: 'some error',
        subscriptions,
        selectedSubscription: subscriptions[0],
        databases,
        databasesAdded: databases,
        loaded: {
          [LoadedAzure.Subscriptions]: true,
          [LoadedAzure.Databases]: true,
          [LoadedAzure.DatabasesAdded]: true,
        },
      }

      const nextState = reducer(stateWithData, resetDataAzure())

      expect(nextState).toEqual(initialState)
    })
  })

  describe('clearSubscriptionsAzure', () => {
    it('should clear subscriptions and all dependent data', () => {
      const stateWithData = {
        ...initialState,
        subscriptions,
        selectedSubscription: subscriptions[0],
        databases,
        databasesAdded: databases,
        loaded: {
          [LoadedAzure.Subscriptions]: true,
          [LoadedAzure.Databases]: true,
          [LoadedAzure.DatabasesAdded]: true,
        },
      }

      const nextState = reducer(stateWithData, clearSubscriptionsAzure())

      expect(nextState.subscriptions).toBeNull()
      expect(nextState.selectedSubscription).toBeNull()
      expect(nextState.databases).toBeNull()
      expect(nextState.databasesAdded).toEqual([])
      expect(nextState.loaded[LoadedAzure.Subscriptions]).toBe(false)
      expect(nextState.loaded[LoadedAzure.Databases]).toBe(false)
      expect(nextState.loaded[LoadedAzure.DatabasesAdded]).toBe(false)
    })
  })

  describe('clearDatabasesAzure', () => {
    it('should clear only databases and preserve subscriptions', () => {
      const stateWithData = {
        ...initialState,
        subscriptions,
        databases,
        databasesAdded: databases,
        loaded: {
          [LoadedAzure.Subscriptions]: true,
          [LoadedAzure.Databases]: true,
          [LoadedAzure.DatabasesAdded]: true,
        },
      }

      const nextState = reducer(stateWithData, clearDatabasesAzure())

      expect(nextState.subscriptions).toEqual(subscriptions)
      expect(nextState.databases).toBeNull()
      expect(nextState.databasesAdded).toEqual([])
      expect(nextState.loaded[LoadedAzure.Subscriptions]).toBe(true)
      expect(nextState.loaded[LoadedAzure.Databases]).toBe(false)
      expect(nextState.loaded[LoadedAzure.DatabasesAdded]).toBe(false)
    })
  })

  // Thunk actions
  describe('thunk actions', () => {
    describe('fetchSubscriptionsAzure', () => {
      it('should dispatch success action when fetch succeeds', async () => {
        const accountId = faker.string.uuid()
        const responsePayload = { data: subscriptions, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        await store.dispatch<any>(fetchSubscriptionsAzure(accountId))

        const expectedActions = [
          loadSubscriptionsAzure(),
          loadSubscriptionsAzureSuccess(subscriptions),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('should dispatch failure action when fetch fails', async () => {
        const accountId = faker.string.uuid()
        const errorMessage = 'Failed to fetch subscriptions'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValueOnce(responsePayload)

        await store.dispatch<any>(fetchSubscriptionsAzure(accountId))

        const expectedActions = [
          loadSubscriptionsAzure(),
          loadSubscriptionsAzureFailure(errorMessage),
          addErrorNotification(
            responsePayload as unknown as IAddInstanceErrorPayload,
          ),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchDatabasesAzure', () => {
      it('should dispatch success action when fetch succeeds', async () => {
        const accountId = faker.string.uuid()
        const subscriptionId = subscriptions[0].subscriptionId
        const responsePayload = { data: databases, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        await store.dispatch<any>(
          fetchDatabasesAzure(accountId, subscriptionId),
        )

        const expectedActions = [
          loadDatabasesAzure(),
          loadDatabasesAzureSuccess(databases),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('should dispatch failure action when fetch fails', async () => {
        const accountId = faker.string.uuid()
        const subscriptionId = subscriptions[0].subscriptionId
        const errorMessage = 'Failed to fetch databases'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValueOnce(responsePayload)

        await store.dispatch<any>(
          fetchDatabasesAzure(accountId, subscriptionId),
        )

        const expectedActions = [
          loadDatabasesAzure(),
          loadDatabasesAzureFailure(errorMessage),
          addErrorNotification(
            responsePayload as unknown as IAddInstanceErrorPayload,
          ),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('addDatabasesAzureAction', () => {
      it('should dispatch success action when add succeeds', async () => {
        const accountId = faker.string.uuid()
        const databaseIds = [databases[0].id, databases[1].id]
        const addResults = [
          { id: databases[0].id, status: ActionStatus.Success, message: '' },
          { id: databases[1].id, status: ActionStatus.Success, message: '' },
        ]
        const responsePayload = { data: addResults, status: 201 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        await store.dispatch<any>(
          addDatabasesAzureAction(accountId, databaseIds),
        )

        const expectedActions = [
          addDatabasesAzure(),
          addDatabasesAzureSuccess(addResults),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('should dispatch failure action when add fails', async () => {
        const accountId = faker.string.uuid()
        const databaseIds = [databases[0].id]
        const errorMessage = 'Failed to add databases'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValueOnce(responsePayload)

        const result = await store.dispatch<any>(
          addDatabasesAzureAction(accountId, databaseIds),
        )

        const expectedActions = [
          addDatabasesAzure(),
          addDatabasesAzureFailure(errorMessage),
          addErrorNotification(
            responsePayload as unknown as IAddInstanceErrorPayload,
          ),
        ]

        expect(store.getActions()).toEqual(expectedActions)
        expect(result).toEqual([])
      })
    })
  })
})
