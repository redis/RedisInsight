import { AxiosError } from 'axios'
import { cloneDeep } from 'lodash'
import { apiService } from 'uiSrc/services'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import {
  GetCloudAccountShortInfoResponse,
  RedisCloudDatabase,
} from 'apiSrc/modules/redis-enterprise/dto/cloud.dto'
import reducer, {
  loadSubscriptionsRedisCloud,
  initialState,
  loadSubscriptionsRedisCloudSuccess,
  cloudSelector,
  loadSubscriptionsRedisCloudFailure,
  loadAccountRedisCloudFailure,
  loadAccountRedisCloudSuccess,
  loadAccountRedisCloud,
  setSSOFlow,
  setIsRecommendedSettingsSSO,
  fetchSubscriptionsRedisCloud,
  fetchAccountRedisCloud,
  loadInstancesRedisCloud,
  fetchInstancesRedisCloud,
  loadInstancesRedisCloudSuccess,
  loadInstancesRedisCloudFailure,
  addInstancesRedisCloud,
  createInstancesRedisCloudFailure,
  createInstancesRedisCloud,
  createInstancesRedisCloudSuccess,
} from '../../instances/cloud'
import { LoadedCloud, RedisCloudSubscriptionType } from '../../interfaces'
import { addErrorNotification } from '../../app/notifications'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
}))

let store: typeof mockedStore
let account: GetCloudAccountShortInfoResponse
let instances: RedisCloudDatabase[]
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()

  account = {
    accountId: 40131,
    accountName: 'Redis Labs',
    ownerName: 'Danny Cohen',
    ownerEmail: 'danny.cohen@redis.com',
  }

  instances = [
    {
      subscriptionId: 113214,
      databaseId: 51121677,
      name: 'New-DB-without-SSL',
      publicEndpoint:
        'redis-11759.c176718.us-east-1-1.ec2.qa-cloud.rlrcp.com:11759',
      status: 'active',
      sslClientAuthentication: false,
      modules: [],
      options: {
        enabledDataPersistence: false,
        persistencePolicy: 'none',
        enabledRedisFlash: false,
        enabledReplication: true,
        enabledBackup: false,
        enabledClustering: false,
        isReplicaDestination: false,
        isReplicaSource: false,
      },
    },
  ]
})

describe('cloud slice', () => {
  describe('reducer, actions and selectors', () => {
    it('should return the initial state on first run', () => {
      // Arrange
      const nextState = initialState

      // Act
      const result = reducer(undefined, {})

      // Assert
      expect(result).toEqual(nextState)
    })
  })

  describe('loadSubscriptionsRedisCloud', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, loadSubscriptionsRedisCloud())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          cloud: nextState,
        },
      })
      expect(cloudSelector(rootState)).toEqual(state)
    })
  })

  describe('loadSubscriptionsRedisCloudSuccess', () => {
    it('should properly set the state with fetched subscriptions', () => {
      // Arrange

      const data = [
        {
          id: 110358,
          name: 'Subscription test example with',
          numberOfDatabases: 1,
          status: 'active',
        },
      ]

      const credentials = {
        accessKey: '123',
        secretKey: '123',
      }
      const state = {
        ...initialState,
        loading: false,

        loaded: {
          ...initialState.loaded,
          [LoadedCloud.Subscriptions]: true,
        },
        subscriptions: data,
        credentials,
      }

      // Act
      const nextState = reducer(
        initialState,
        loadSubscriptionsRedisCloudSuccess({ data, credentials }),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          cloud: nextState,
        },
      })
      expect(cloudSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data: any[] = []

      const credentials = {
        accessKey: '123',
        secretKey: '123',
      }
      const state = {
        ...initialState,
        loading: false,

        loaded: {
          ...initialState.loaded,
          [LoadedCloud.Subscriptions]: true,
        },
        subscriptions: data,
        credentials,
      }

      // Act
      const nextState = reducer(
        initialState,
        loadSubscriptionsRedisCloudSuccess({ data, credentials }),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          cloud: nextState,
        },
      })
      expect(cloudSelector(rootState)).toEqual(state)
    })
  })

  describe('loadSubscriptionsRedisCloudFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
      }

      // Act
      const nextState = reducer(
        initialState,
        loadSubscriptionsRedisCloudFailure(data),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          cloud: nextState,
        },
      })
      expect(cloudSelector(rootState)).toEqual(state)
    })
  })

  describe('loadAccountRedisCloud', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, loadAccountRedisCloud())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          cloud: nextState,
        },
      })
      expect(cloudSelector(rootState)).toEqual(state)
    })
  })

  describe('loadAccountRedisCloudSuccess', () => {
    it('should properly set the state with fetched subscriptions', () => {
      // Arrange

      const data = {
        accountId: 40131,
        accountName: 'Redis Labs',
        ownerName: 'Danny Cohen',
        ownerEmail: 'danny.cohen@redis.com',
      }

      const state = {
        ...initialState,
        loading: false,

        account: {
          data,
          error: '',
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        loadAccountRedisCloudSuccess({ data }),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          cloud: nextState,
        },
      })
      expect(cloudSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data: any = {}

      const credentials = {
        accessKey: '123',
        secretKey: '123',
      }
      const state = {
        ...initialState,
        loading: false,
        account: {
          data,
          error: '',
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        loadAccountRedisCloudSuccess({ data, credentials }),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          cloud: nextState,
        },
      })
      expect(cloudSelector(rootState)).toEqual(state)
    })
  })

  describe('loadAccountRedisCloudFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        account: {
          data: null,
          error: data,
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        loadAccountRedisCloudFailure(data),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          cloud: nextState,
        },
      })
      expect(cloudSelector(rootState)).toEqual(state)
    })
  })

  describe('loadInstancesRedisCloud', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, loadInstancesRedisCloud())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          cloud: nextState,
        },
      })
      expect(cloudSelector(rootState)).toEqual(state)
    })
  })

  describe('loadInstancesRedisCloudSuccess', () => {
    it('should properly set the state with fetched instances', () => {
      // Arrange

      const state = {
        ...initialState,
        loading: false,
        data: [],
        loaded: {
          ...initialState.loaded,
          [LoadedCloud.Instances]: true,
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        loadInstancesRedisCloudSuccess({ instances }),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          cloud: nextState,
        },
      })
      expect(cloudSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data: any = []

      const state = {
        ...initialState,
        loading: false,
        data,
        loaded: {
          ...initialState.loaded,
          [LoadedCloud.Instances]: true,
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        loadInstancesRedisCloudSuccess({ data }),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          cloud: nextState,
        },
      })
      expect(cloudSelector(rootState)).toEqual(state)
    })
  })

  describe('loadInstancesRedisCloudFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
      }

      // Act
      const nextState = reducer(
        initialState,
        loadInstancesRedisCloudFailure(data),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          cloud: nextState,
        },
      })
      expect(cloudSelector(rootState)).toEqual(state)
    })
  })

  describe('createInstancesRedisCloud', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, createInstancesRedisCloud())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          cloud: nextState,
        },
      })
      expect(cloudSelector(rootState)).toEqual(state)
    })
  })

  describe('createInstancesRedisCloudSuccess', () => {
    it('should properly set the state with created instances', () => {
      // Arrange

      const dataAdded = [
        {
          databaseIdAdded: 51121677,
          messageAdded: undefined,
          statusAdded: 'active',
          subscriptionIdAdded: 113214,
          subscriptionName: '',
        },
      ]

      const state = {
        ...initialState,
        loading: false,
        dataAdded,
        loaded: {
          ...initialState.loaded,
          [LoadedCloud.InstancesAdded]: true,
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        createInstancesRedisCloudSuccess(instances),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          cloud: nextState,
        },
      })
      expect(cloudSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data: any = []

      const state = {
        ...initialState,
        loading: false,
        dataAdded: data,
        loaded: {
          ...initialState.loaded,
          [LoadedCloud.InstancesAdded]: true,
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        createInstancesRedisCloudSuccess(data),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          cloud: nextState,
        },
      })
      expect(cloudSelector(rootState)).toEqual(state)
    })
  })

  describe('createInstancesRedisCloudFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
      }

      // Act
      const nextState = reducer(
        initialState,
        createInstancesRedisCloudFailure(data),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          cloud: nextState,
        },
      })
      expect(cloudSelector(rootState)).toEqual(state)
    })
  })

  describe('setSSOFlow', () => {
    it('should properly set setSSOFlow', () => {
      // Arrange
      const data = 'import'
      const state = {
        ...initialState,
        ssoFlow: 'import',
      }

      // Act
      const nextState = reducer(initialState, setSSOFlow(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          cloud: nextState,
        },
      })
      expect(cloudSelector(rootState)).toEqual(state)
    })
  })

  describe('setIsRecommendedSettingsSSO', () => {
    it('should properly set state', () => {
      // Arrange
      const data = true
      const state = {
        ...initialState,
        isRecommendedSettings: true,
      }

      // Act
      const nextState = reducer(initialState, setIsRecommendedSettingsSSO(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          cloud: nextState,
        },
      })
      expect(cloudSelector(rootState)).toEqual(state)
    })
  })

  describe('thunks', () => {
    describe('fetchSubscriptionsRedisCloud', () => {
      it('call fetchSubscriptionsRedisCloud, loadSubscriptionsRedisCloud, and loadSubscriptionsRedisCloudSuccess when fetch is successed', async () => {
        // Arrange
        const data = [
          {
            id: 110358,
            type: RedisCloudSubscriptionType.Flexible,
            name: 'Subscription test example with',
            numberOfDatabases: 1,
            status: 'active',
          },
        ]
        const credentials = {
          accessKey: '123',
          secretKey: '123',
        }
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchSubscriptionsRedisCloud(credentials))

        // Assert
        const expectedActions = [
          loadSubscriptionsRedisCloud(),
          loadSubscriptionsRedisCloudSuccess({
            data: responsePayload.data,
            credentials,
          }),
          loadAccountRedisCloud(),
          loadAccountRedisCloudSuccess({ data }),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('call fetchSubscriptionsRedisCloud, loadSubscriptionsRedisCloud, and loadSubscriptionsRedisCloudFailure when fetch is failure', async () => {
        // Arrange
        const credentials = {
          accessKey: '123',
          secretKey: '123',
        }

        const errorMessage =
          'Could not connect to aoeu:123, please check the connection details.'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(fetchSubscriptionsRedisCloud(credentials))

        // Assert
        const expectedActions = [
          loadSubscriptionsRedisCloud(),
          loadSubscriptionsRedisCloudFailure(
            responsePayload.response.data.message,
          ),
          addErrorNotification(responsePayload as AxiosError),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchAccountRedisCloud', () => {
      it('call fetchAccountRedisCloud and loadAccountRedisCloudSuccess when fetch is successed', async () => {
        // Arrange
        const credentials = {
          accessKey: '123',
          secretKey: '123',
        }
        const responsePayload = { data: account, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchAccountRedisCloud(credentials))

        // Assert
        const expectedActions = [
          loadAccountRedisCloud(),
          loadAccountRedisCloudSuccess({
            data: responsePayload.data,
          }),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('call fetchAccountRedisCloud and loadAccountRedisCloudFailure when fetch is failure', async () => {
        // Arrange
        const credentials = {
          accessKey: '123',
          secretKey: '123',
        }

        const errorMessage =
          'Could not connect to aoeu:123, please check the connection details.'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(fetchAccountRedisCloud(credentials))

        // Assert
        const expectedActions = [
          loadAccountRedisCloud(),
          loadAccountRedisCloudFailure(responsePayload.response.data.message),
          addErrorNotification(responsePayload as AxiosError),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchInstancesRedisCloud', () => {
      it('call fetchInstancesRedisCloud and loadInstancesRedisCloudSuccess when fetch is successed', async () => {
        // Arrange
        const subscriptions = [
          {
            subscriptionId: 1,
            subscriptionType: RedisCloudSubscriptionType.Flexible,
            free: false,
          },
          {
            subscriptionId: 2,
            subscriptionType: RedisCloudSubscriptionType.Flexible,
            free: false,
          },
          {
            subscriptionId: 3,
            subscriptionType: RedisCloudSubscriptionType.Fixed,
            free: true,
          },
        ]
        const credentials = {
          accessKey: '123',
          secretKey: '123',
        }
        const responsePayload = { data: instances, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          fetchInstancesRedisCloud({ subscriptions, credentials }),
        )

        // Assert
        const expectedActions = [
          loadInstancesRedisCloud(),
          loadInstancesRedisCloudSuccess({
            data: responsePayload.data,
            credentials: { subscriptions, credentials },
          }),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('call fetchInstancesRedisCloud and loadInstancesRedisCloudFailure when fetch is failure', async () => {
        // Arrange
        const ids = [1, 2, 3]
        const credentials = {
          accessKey: '123',
          secretKey: '123',
        }

        const errorMessage =
          'Could not connect to aoeu:123, please check the connection details.'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(
          fetchInstancesRedisCloud({ ids, credentials }),
        )

        // Assert
        const expectedActions = [
          loadInstancesRedisCloud(),
          loadInstancesRedisCloudFailure(responsePayload.response.data.message),
          addErrorNotification(responsePayload as AxiosError),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('addInstancesRedisCloud', () => {
      it('call addInstancesRedisCloud and createInstancesRedisCloudSuccess when fetch is successed', async () => {
        // Arrange
        const databasesPicked = [
          { subscriptionId: '1231', databaseId: '123', free: false },
        ]
        const credentials = {
          accessKey: '123',
          secretKey: '123',
        }
        const responsePayload = { data: instances, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          addInstancesRedisCloud({ databases: databasesPicked, credentials }),
        )

        // Assert
        const expectedActions = [
          createInstancesRedisCloud(),
          createInstancesRedisCloudSuccess(responsePayload.data),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('call addInstancesRedisCloud and createInstancesRedisCloudFailure when fetch is failure', async () => {
        // Arrange
        const databasesPicked = [
          { subscriptionId: '1231', databaseId: '123', free: false },
        ]
        const credentials = {
          accessKey: '123',
          secretKey: '123',
        }

        const errorMessage =
          'Could not connect to aoeu:123, please check the connection details.'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(
          addInstancesRedisCloud({ databases: databasesPicked, credentials }),
        )

        // Assert
        const expectedActions = [
          createInstancesRedisCloud(),
          createInstancesRedisCloudFailure(
            responsePayload.response.data.message,
          ),
          addErrorNotification(responsePayload as AxiosError),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
