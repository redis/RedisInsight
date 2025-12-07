import { AxiosError } from 'axios'
import { cloneDeep } from 'lodash'
import { apiService } from 'uiSrc/services'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import {
  ClusterConnectionDetailsDto,
  RedisEnterpriseDatabase,
} from 'apiSrc/modules/redis-enterprise/dto/cluster.dto'
import { AddRedisEnterpriseDatabaseResponse } from 'apiSrc/modules/redis-enterprise/dto/redis-enterprise-cluster.dto'
import reducer, {
  initialState,
  loadInstancesRedisCluster,
  loadInstancesRedisClusterSuccess,
  loadInstancesRedisClusterFailure,
  clusterSelector,
  fetchInstancesRedisCluster,
  createInstancesRedisCluster,
  createInstancesRedisClusterSuccess,
  createInstancesRedisClusterFailure,
  addInstancesRedisCluster,
} from '../../instances/cluster'

import { addErrorNotification } from '../../app/notifications'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
}))

let store: typeof mockedStore
let defaultCredentials: ClusterConnectionDetailsDto
let defaultData: RedisEnterpriseDatabase[]
let defaultDataAdded: AddRedisEnterpriseDatabaseResponse[]
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()

  defaultCredentials = {
    host: 'localhost',
    port: 9443,
    username: 'e@e.com',
    password: '1',
  }

  defaultData = [
    {
      uid: 2,
      name: 'test2',
      dnsName: 'redis-14249.enterprise',
      address: '172.17.0.2',
      port: 14249,
      status: 'active',
      tls: false,
      modules: [],
      tags: [],
      options: {
        enabledDataPersistence: false,
        persistencePolicy: 'none',
        enabledRedisFlash: false,
        enabledReplication: false,
        enabledBackup: false,
        enabledActiveActive: false,
        enabledClustering: false,
        isReplicaDestination: false,
        isReplicaSource: false,
      },
    },
    {
      uid: 1,
      name: 'test',
      dnsName: 'redis-12000.enterprise',
      address: '172.17.0.2',
      port: 12000,
      status: 'active',
      tls: false,
      modules: ['graph', 'search', 'ReJSON', 'bf', 'timeseries'],
      tags: [],
      options: {
        enabledDataPersistence: true,
        persistencePolicy: 'aof-every-write',
        enabledRedisFlash: false,
        enabledReplication: false,
        enabledBackup: false,
        enabledActiveActive: false,
        enabledClustering: false,
        isReplicaDestination: false,
        isReplicaSource: false,
      },
    },
  ]

  defaultDataAdded = [
    {
      uid: 1,
      status: 'success',
      message: 'Added',
      databaseDetails: {
        uid: 1,
        name: 'test',
        dnsName: 'redis-12000.enterprise',
        address: '172.17.0.2',
        port: 12000,
        status: 'active',
        tls: false,
        modules: ['graph', 'search', 'ReJSON', 'bf', 'timeseries'],
        tags: [],
        options: {
          enabledDataPersistence: true,
          persistencePolicy: 'aof-every-write',
          enabledRedisFlash: false,
          enabledReplication: false,
          enabledBackup: false,
          enabledActiveActive: false,
          enabledClustering: false,
          isReplicaDestination: false,
          isReplicaSource: false,
        },
      },
    },
    {
      uid: 2,
      status: 'fail',
      message:
        'Could not connect to localhost:11243, please check the connection details.',
      databaseDetails: {
        uid: 2,
        name: 'test2',
        dnsName: 'redis-14249.enterprise',
        address: '172.17.0.2',
        port: 14249,
        status: 'active',
        tls: false,
        modules: [],
        tags: [],
        options: {
          enabledDataPersistence: false,
          persistencePolicy: 'none',
          enabledRedisFlash: false,
          enabledReplication: false,
          enabledBackup: false,
          enabledActiveActive: false,
          enabledClustering: false,
          isReplicaDestination: false,
          isReplicaSource: false,
        },
      },
    },
  ]
})

describe('cluster slice', () => {
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

  describe('loadInstancesRedisCluster', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, loadInstancesRedisCluster())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          cluster: nextState,
        },
      })
      expect(clusterSelector(rootState)).toEqual(state)
    })
  })

  describe('loadInstancesRedisClusterSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: false,
        data: defaultData,
        credentials: defaultCredentials,
      }

      // Act
      const nextState = reducer(
        initialState,
        loadInstancesRedisClusterSuccess({
          data: defaultData,
          credentials: defaultCredentials,
        }),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          cluster: nextState,
        },
      })
      expect(clusterSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data: any = []

      const state = {
        ...initialState,
        loading: false,
        data,
        credentials: defaultCredentials,
      }

      // Act
      const nextState = reducer(
        initialState,
        loadInstancesRedisClusterSuccess({
          data,
          credentials: defaultCredentials,
        }),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          cluster: nextState,
        },
      })
      expect(clusterSelector(rootState)).toEqual(state)
    })
  })

  describe('loadInstancesRedisClusterFailure', () => {
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
        loadInstancesRedisClusterFailure(data),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          cluster: nextState,
        },
      })
      expect(clusterSelector(rootState)).toEqual(state)
    })
  })

  describe('createInstancesRedisCluster', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, createInstancesRedisCluster())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          cluster: nextState,
        },
      })
      expect(clusterSelector(rootState)).toEqual(state)
    })
  })

  describe('createInstancesRedisClusterSuccess', () => {
    it('should properly set the state with created instances', () => {
      // Arrange

      const dataAdded = [
        {
          uidAdded: 2,
          statusAdded: 'active',
          messageAdded: undefined,
        },
        {
          uidAdded: 1,
          statusAdded: 'active',
          messageAdded: undefined,
        },
      ]

      const state = {
        ...initialState,
        loading: false,
        dataAdded,
      }

      // Act
      const nextState = reducer(
        initialState,
        createInstancesRedisClusterSuccess(defaultData),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          cluster: nextState,
        },
      })
      expect(clusterSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data: any = []

      const state = {
        ...initialState,
        loading: false,
        dataAdded: data,
      }

      // Act
      const nextState = reducer(
        initialState,
        createInstancesRedisClusterSuccess(data),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          cluster: nextState,
        },
      })
      expect(clusterSelector(rootState)).toEqual(state)
    })
  })

  describe('createInstancesRedisClusterFailure', () => {
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
        createInstancesRedisClusterFailure(data),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          cluster: nextState,
        },
      })
      expect(clusterSelector(rootState)).toEqual(state)
    })
  })

  describe('thunks', () => {
    describe('fetchInstancesRedisCluster', () => {
      it('call both fetchInstancesRedisCluster and loadInstancesRedisClusterSuccess when fetch is successed', async () => {
        // Arrange
        const responsePayload = { data: defaultData, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          fetchInstancesRedisCluster(defaultCredentials),
        )

        // Assert
        const expectedActions = [
          loadInstancesRedisCluster(),
          loadInstancesRedisClusterSuccess({
            data: responsePayload.data,
            credentials: defaultCredentials,
          }),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('call both fetchInstancesRedisCluster and loadInstancesRedisClusterFailure when fetch is fail', async () => {
        // Arrange
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
          fetchInstancesRedisCluster(defaultCredentials),
        )

        // Assert
        const expectedActions = [
          loadInstancesRedisCluster(),
          loadInstancesRedisClusterFailure(
            responsePayload.response.data.message,
          ),
          addErrorNotification(responsePayload as AxiosError),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('addInstancesRedisCluster', () => {
      it('call both addInstancesRedisCluster and createInstancesRedisClusterSuccess when fetch is successed', async () => {
        // Arrange

        const uids = [1, 2]
        const responsePayload = { data: defaultDataAdded, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          addInstancesRedisCluster({ uids, credentials: defaultCredentials }),
        )

        // Assert
        const expectedActions = [
          createInstancesRedisCluster(),
          createInstancesRedisClusterSuccess(responsePayload.data),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('call both addInstancesRedisCluster and createInstancesRedisClusterFailure when fetch is fail', async () => {
        // Arrange
        const uids = [1, 2]

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
          addInstancesRedisCluster({ uids, credentials: defaultCredentials }),
        )

        // Assert
        const expectedActions = [
          createInstancesRedisCluster(),
          createInstancesRedisClusterFailure(
            responsePayload.response.data.message,
          ),
          addErrorNotification(responsePayload as AxiosError),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
