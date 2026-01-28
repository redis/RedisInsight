import { AxiosError } from 'axios'
import { cloneDeep, map, omit } from 'lodash'

import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import { CustomErrorCodes, apiErrors } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { checkRediStack } from 'uiSrc/utils'
import { INFINITE_MESSAGES } from 'uiSrc/components/notifications/components'
import { setAppContextInitialState } from 'uiSrc/slices/app/context'
import { resetKeys } from 'uiSrc/slices/browser/keys'
import reducer, {
  initialState,
  instancesSelector,
  loadInstances,
  loadInstancesSuccess,
  loadInstancesFailure,
  fetchInstancesAction,
  createInstanceStandaloneAction,
  defaultInstanceChanging,
  defaultInstanceChangingSuccess,
  defaultInstanceChangingFailure,
  testConnection,
  testConnectionSuccess,
  testConnectionFailure,
  updateInstanceAction,
  deleteInstancesAction,
  setDefaultInstance,
  setDefaultInstanceSuccess,
  setDefaultInstanceFailure,
  checkConnectToInstanceAction,
  getDatabaseConfigInfo,
  getDatabaseConfigInfoSuccess,
  getDatabaseConfigInfoFailure,
  getDatabaseConfigInfoAction,
  changeInstanceAlias,
  changeInstanceAliasFailure,
  changeInstanceAliasSuccess,
  changeInstanceAliasAction,
  resetConnectedInstance,
  setEditedInstance,
  fetchEditedInstanceAction,
  setConnectedInstanceId,
  setConnectedInstance,
  setConnectedInstanceFailure,
  setConnectedInstanceSuccess,
  importInstancesFromFile,
  importInstancesFromFileSuccess,
  importInstancesFromFileFailure,
  resetImportInstances,
  importInstancesSelector,
  uploadInstancesFile,
  checkDatabaseIndexFailure,
  checkDatabaseIndexSuccess,
  checkDatabaseIndex,
  checkDatabaseIndexAction,
  setConnectedInfoInstance,
  setConnectedInfoInstanceSuccess,
  fetchConnectedInstanceInfoAction,
  testInstanceStandaloneAction,
  updateEditedInstance,
  exportInstancesAction,
  autoCreateAndConnectToInstanceAction,
  cloneInstanceAction,
} from '../../instances/instances'
import {
  addErrorNotification,
  addInfiniteNotification,
  addMessageNotification,
  IAddInstanceErrorPayload,
} from '../../app/notifications'
import {
  ConnectionType,
  InitialStateInstances,
  Instance,
} from '../../interfaces'
import { loadMastersSentinel } from '../../instances/sentinel'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
}))

let store: typeof mockedStore
let instances: Instance[]

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()

  instances = [
    {
      id: 'e37cc441-a4f2-402c-8bdb-fc2413cbbaff',
      version: '6.2.6',
      host: 'localhost',
      port: 6379,
      name: 'localhost',
      username: null,
      password: null,
      connectionType: ConnectionType.Standalone,
      nameFromProvider: null,
      modules: [],
      lastConnection: new Date('2021-04-22T09:03:56.917Z'),
    },
    {
      id: 'a0db1bc8-a353-4c43-a856-b72f4811d2d4',
      host: 'localhost',
      port: 12000,
      name: 'oea123123',
      username: null,
      password: null,
      connectionType: ConnectionType.Standalone,
      nameFromProvider: null,
      modules: [],
      tls: {
        verifyServerCert: true,
        caCertId: '70b95d32-c19d-4311-bb24-e684af12cf15',
        clientCertPairId: '70b95d32-c19d-4311-b23b24-e684af12cf15',
      },
    },
    {
      id: 'b83a3932-e95f-4f09-9d8a-55079f400186',
      version: '6.2.6',
      host: 'localhost',
      port: 5005,
      name: 'sentinel',
      username: null,
      password: null,
      connectionType: ConnectionType.Sentinel,
      nameFromProvider: null,
      lastConnection: new Date('2021-04-22T18:40:44.031Z'),
      modules: [],
      endpoints: [
        {
          host: 'localhost',
          port: 5005,
        },
        {
          host: '127.0.0.1',
          port: 5006,
        },
      ],
      sentinelMaster: {
        name: 'mymaster',
      },
    },
  ]
})

describe('instances slice', () => {
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

  describe('loadInstances', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, loadInstances())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('defaultInstanceChanging', () => {
    it('should properly set loading = true', () => {
      // Arrange

      const state = {
        ...initialState,
        loadingChanging: true,
      }

      // Act
      const nextState = reducer(initialState, defaultInstanceChanging())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('testConnection', () => {
    it('should properly set loading = true', () => {
      // Arrange

      const state = {
        ...initialState,
        loadingChanging: true,
      }

      // Act
      const nextState = reducer(initialState, testConnection())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('testConnectionSuccess', () => {
    it('should properly set loading = false', () => {
      // Arrange
      const prevState: InitialStateInstances = {
        ...initialState,
        loadingChanging: true,
      }
      const state = {
        ...initialState,
        loadingChanging: false,
      }

      // Act
      const nextState = reducer(prevState, testConnectionSuccess())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('testConnectionFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loadingChanging: false,
        errorChanging: data,
      }

      // Act
      const nextState = reducer(initialState, testConnectionFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('changeInstanceAlias', () => {
    it('should properly set loading = true', () => {
      // Arrange

      const state = {
        ...initialState,
        loadingChanging: true,
        errorChanging: '',
      }

      // Act
      const nextState = reducer(initialState, changeInstanceAlias())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('changeInstanceAliasSuccess', () => {
    it('should properly set the state', () => {
      // Arrange
      const prevState: InitialStateInstances = {
        ...initialState,
        data: [instances[0], instances[1]],
      }
      const state = {
        ...initialState,
        loadingChanging: false,
        data: [{ ...instances[0], name: 'newAlias' }, instances[1]],
      }

      // Act
      const nextState = reducer(
        prevState,
        changeInstanceAliasSuccess({ id: instances[0].id, name: 'newAlias' }),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('changeInstanceAliasFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loadingChanging: false,
        errorChanging: data,
      }

      // Act
      const nextState = reducer(initialState, changeInstanceAliasFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('loadInstancesSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const state = {
        ...initialState,
        loading: false,
        data: checkRediStack(instances),
      }

      // Act
      const nextState = reducer(initialState, loadInstancesSuccess(instances))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data: any = []

      const state = {
        ...initialState,
        loading: false,
        data,
      }

      // Act
      const nextState = reducer(initialState, loadInstancesSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('loadInstancesFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
        data: [],
      }

      // Act
      const nextState = reducer(initialState, loadInstancesFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('getDatabaseConfigInfo', () => {
    it('should properly set state before fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
      }

      // Act
      const nextState = reducer(initialState, getDatabaseConfigInfo())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('getDatabaseConfigInfoSuccess', () => {
    it('should properly set state after fetch data', () => {
      // Arrange
      const data = {
        version: '6.2',
        totalKeys: 10,
        usedMemory: 5,
        connectedClients: 1,
        opsPerSecond: 2,
        networkInKbps: 0,
        networkOutKbps: 0,
        cpuUsagePercentage: null,
      }
      const state = {
        ...initialState,
        instanceOverview: data,
      }

      // Act
      const nextState = reducer(
        initialState,
        getDatabaseConfigInfoSuccess(data),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('getDatabaseConfigInfoFailure', () => {
    it('should properly set error', () => {
      // Arrange
      const error = 'some error'
      const state = {
        ...initialState,
        error,
      }

      // Act
      const nextState = reducer(
        initialState,
        getDatabaseConfigInfoFailure(error),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('setConnectedInstanceId', () => {
    it('should properly set "id"', () => {
      // Arrange
      const id = 'id'
      const state: InitialStateInstances = {
        ...initialState,
        connectedInstance: {
          ...initialState.connectedInstance,
          id,
        },
      }

      // Act
      const nextState = reducer(initialState, setConnectedInstanceId(id))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('setConnectedInstance', () => {
    it('should properly set loading = "true"', () => {
      // Arrange
      const state: InitialStateInstances = {
        ...initialState,
        connectedInstance: {
          ...initialState.connectedInstance,
          loading: true,
        },
      }

      // Act
      const nextState = reducer(initialState, setConnectedInstance())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('setConnectedInstanceSuccess', () => {
    it('should properly set error', () => {
      // Arrange
      const instance = { ...instances[1] }
      const state: InitialStateInstances = {
        ...initialState,
        connectedInstance: {
          ...instance,
          loading: false,
          isRediStack: false,
          isFreeDb: false,
          db: undefined,
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        setConnectedInstanceSuccess(instance),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('setConnectedInstanceFailure', () => {
    it('should properly set loading = "false"', () => {
      // Arrange
      const state = {
        ...initialState,
        connectedInstance: {
          ...initialState.connectedInstance,
          loading: false,
        },
      }

      // Act
      const nextState = reducer(initialState, setConnectedInstanceFailure())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('setConnectedInfoInstance', () => {
    it('should properly set initial state', () => {
      // Arrange
      const currentState = {
        ...initialState,
        instanceInfo: {
          version: '6.12.0',
          databases: 12,
          server: {},
        },
      }
      const state: InitialStateInstances = {
        ...initialState,
        instanceInfo: initialState.instanceInfo,
      }

      // Act
      const nextState = reducer(currentState, setConnectedInfoInstance())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('setConnectedInfoInstanceSuccess', () => {
    it('should properly set state', () => {
      // Arrange
      const payload = {
        version: '6.12.0',
        databases: 12,
        server: {},
      }
      const state: InitialStateInstances = {
        ...initialState,
        instanceInfo: payload,
      }

      // Act
      const nextState = reducer(
        initialState,
        setConnectedInfoInstanceSuccess(payload),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('setEditedInstance', () => {
    it('should properly set state', () => {
      // Arrange
      const data = instances[1]
      const state = {
        ...initialState,
        editedInstance: {
          ...initialState.editedInstance,
          data,
        },
      }

      // Act
      const nextState = reducer(initialState, setEditedInstance(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('updateEditedInstance', () => {
    it('should properly set state', () => {
      // Arrange
      const data = instances[1]
      const state = {
        ...initialState,
        editedInstance: {
          ...initialState.editedInstance,
          data,
        },
      }

      // Act
      const nextState = reducer(initialState, updateEditedInstance(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('importInstancesFromFile', () => {
    it('should properly set state', () => {
      // Arrange
      const state = {
        ...initialState.importInstances,
        loading: true,
        error: '',
      }

      // Act
      const nextState = reducer(initialState, importInstancesFromFile())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          instances: nextState,
        },
      })
      expect(importInstancesSelector(rootState)).toEqual(state)
    })
  })

  describe('importInstancesFromFileSuccess', () => {
    it('should properly set state', () => {
      // Arrange
      const mockedError = {
        statusCode: 400,
        message: 'message',
        error: 'error',
      }
      const data = {
        total: 3,
        fail: [{ index: 0, status: 'fail', errors: [mockedError] }],
        partial: [{ index: 2, status: 'fail', errors: [mockedError] }],
        success: [
          { index: 1, status: 'success', port: 1233, host: 'localhost' },
        ],
      }
      const state = {
        ...initialState.importInstances,
        loading: false,
        data,
      }

      // Act
      const nextState = reducer(
        initialState,
        importInstancesFromFileSuccess(data),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          instances: nextState,
        },
      })
      expect(importInstancesSelector(rootState)).toEqual(state)
    })
  })

  describe('importInstancesFromFileFailure', () => {
    it('should properly set state', () => {
      // Arrange
      const error = 'Some error'
      const state = {
        ...initialState.importInstances,
        loading: false,
        error,
      }

      // Act
      const nextState = reducer(
        initialState,
        importInstancesFromFileFailure(error),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          instances: nextState,
        },
      })
      expect(importInstancesSelector(rootState)).toEqual(state)
    })
  })

  describe('resetImportInstances', () => {
    it('should properly set state', () => {
      // Arrange
      const mockedError = {
        statusCode: 400,
        message: 'message',
        error: 'error',
      }
      const currentState = {
        ...initialState,
        importInstances: {
          ...initialState.importInstances,
          data: {
            total: 3,
            fail: [{ index: 0, status: 'fail', errors: [mockedError] }],
            partial: [{ index: 2, status: 'fail', errors: [mockedError] }],
            success: [
              { index: 1, status: 'success', port: 1233, host: 'localhost' },
            ],
          },
        },
      }

      const state = {
        ...initialState.importInstances,
      }

      // Act
      const nextState = reducer(currentState, resetImportInstances())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          instances: nextState,
        },
      })
      expect(importInstancesSelector(rootState)).toEqual(state)
    })
  })

  describe('checkDatabaseIndex', () => {
    it('should properly set state', () => {
      // Arrange
      const state = {
        ...initialState,
        connectedInstance: {
          ...initialState.connectedInstance,
          loading: true,
        },
      }

      // Act
      const nextState = reducer(initialState, checkDatabaseIndex())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('checkDatabaseIndexSuccess', () => {
    it('should properly set state', () => {
      // Arrange
      const state = {
        ...initialState,
        connectedInstance: {
          ...initialState.connectedInstance,
          loading: false,
          db: 5,
        },
      }

      // Act
      const nextState = reducer(initialState, checkDatabaseIndexSuccess(5))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('checkDatabaseIndexFailure', () => {
    it('should properly set state', () => {
      // Arrange
      const state = {
        ...initialState,
        connectedInstance: {
          ...initialState.connectedInstance,
          loading: false,
        },
      }

      // Act
      const nextState = reducer(initialState, checkDatabaseIndexFailure())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('thunks', () => {
    describe('fetchInstances', () => {
      it('call both fetchInstances and loadInstancesSuccess when fetch is successed', async () => {
        // Arrange
        const responsePayload = { data: instances, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchInstancesAction())

        // Assert
        const expectedActions = [
          loadInstances(),
          loadInstancesSuccess(responsePayload.data),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('call both fetchInstances and loadInstancesFailure when fetch is fail', async () => {
        // Arrange
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
        await store.dispatch<any>(fetchInstancesAction())

        // Assert
        const expectedActions = [
          loadInstances(),
          loadInstancesFailure(responsePayload.response.data.message),
          addErrorNotification(responsePayload as AxiosError),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('createInstanceStandaloneAction', () => {
      it('call both createInstanceStandaloneAction and defaultInstanceChangingSuccess when fetch is successed', async () => {
        // Arrange
        const requestData = {
          name: 'db',
          host: 'localhost',
          port: 6379,
        }

        const responsePayload = { status: 201 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          createInstanceStandaloneAction(requestData, jest.fn()),
        )

        // Assert
        const expectedActions = [
          defaultInstanceChanging(),
          defaultInstanceChangingSuccess(),
          loadInstances(),
          addMessageNotification(
            successMessages.ADDED_NEW_INSTANCE(requestData.name),
          ),
        ]

        expect(store.getActions().splice(0, expectedActions.length)).toEqual(
          expectedActions,
        )
      })

      it('call both createInstanceStandaloneAction and defaultInstanceChangingFailure when fetch is fail', async () => {
        // Arrange
        const requestData = {
          name: 'db',
          host: 'localhost',
          port: 6379,
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
          createInstanceStandaloneAction(requestData, () => ({})),
        )

        // Assert
        const expectedActions = [
          defaultInstanceChanging(),
          defaultInstanceChangingFailure(responsePayload.response.data.message),
          addErrorNotification(responsePayload as AxiosError),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('redirect to sentinel flow when user try connect to Sentinel like Stanalone createInstanceStandaloneAction', async () => {
        // Arrange
        const requestData = {
          name: 'db',
          host: 'localhost',
          port: 6379,
        }

        const errorMessage =
          'Could not connect to aoeu:123, please check the connection details.'
        const responsePayload = {
          response: {
            status: 400,
            data: {
              message: errorMessage,
              error: apiErrors.SentinelParamsRequired,
            },
          },
        }

        apiService.post = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(
          createInstanceStandaloneAction(requestData, () => ({})),
        )

        // Assert
        const expectedActions = [
          defaultInstanceChanging(),
          defaultInstanceChangingFailure(responsePayload.response.data.message),
          loadMastersSentinel(),
        ]

        expect(store.getActions().splice(0, 3)).toEqual(expectedActions)
      })

      it('should call proper actions on fail with errorCode=11_200 (Database already exists)', async () => {
        // Arrange
        const mockId = '123'
        const mockName = 'name'
        const requestData = {
          name: mockName,
          host: 'localhost',
          port: 6379,
        }

        const errorMessage = 'some error'
        const responsePayload = {
          response: {
            status: 500,
            data: {
              message: errorMessage,
              errorCode: CustomErrorCodes.DatabaseAlreadyExists,
              resource: {
                databaseId: mockId,
              },
            },
          },
        }

        apiService.post = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(createInstanceStandaloneAction(requestData))

        // Assert
        const expectedActions = [
          defaultInstanceChanging(),
          resetKeys(),
          setAppContextInitialState(),
          setConnectedInstanceId(mockId),
          setDefaultInstance(),
          resetConnectedInstance(),
        ]
        expect(store.getActions().slice(0, expectedActions.length)).toEqual(
          expectedActions,
        )
      })
    })

    describe('deleteInstances', () => {
      it('call both deleteInstances and setDefaultInstanceSuccess when fetch is successed for only one instance', async () => {
        // Arrange
        const requestData = [instances[0]]

        const responsePayload = { status: 200 }

        apiService.delete = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(deleteInstancesAction(requestData))

        // Assert
        const expectedActions = [
          setDefaultInstance(),
          setDefaultInstanceSuccess(),
          loadInstances(),
          addMessageNotification(
            successMessages.DELETE_INSTANCE(requestData[0].name ?? ''),
          ),
        ]

        const actions = store.getActions()
        // skip thunk action
        const testActions = [
          ...actions.slice(0, expectedActions.length - 1),
          actions[expectedActions.length],
        ]

        expect(testActions).toEqual(expectedActions)
      })

      it('call both deleteInstances and setDefaultInstanceSuccess when fetch is successed for several instances', async () => {
        // Arrange
        const requestData = instances.slice(0, 3)

        const responsePayload = { status: 200 }

        apiService.delete = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(deleteInstancesAction(requestData))

        // Assert
        const expectedActions = [
          setDefaultInstance(),
          setDefaultInstanceSuccess(),
          loadInstances(),
          addMessageNotification(
            successMessages.DELETE_INSTANCES(map(requestData, 'name')),
          ),
        ]

        const actions = store.getActions()
        // skip thunk action
        const testActions = [
          ...actions.slice(0, expectedActions.length - 1),
          actions[expectedActions.length],
        ]

        expect(testActions).toEqual(expectedActions)
      })

      it('call both deleteInstances and setDefaultInstanceFailure when fetch is fail', async () => {
        // Arrange
        const requestData = instances.slice(0, 3)

        const errorMessage =
          'Could not connect to aoeu:123, please check the connection details.'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.delete = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(deleteInstancesAction(requestData))

        // Assert
        const expectedActions = [
          setDefaultInstance(),
          setDefaultInstanceFailure(responsePayload.response.data.message),
          addErrorNotification(responsePayload as AxiosError),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('exportInstancesAction', () => {
      it('should call proper actions on success', async () => {
        // Arrange

        const responsePayload = { status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          exportInstancesAction(map(instances, 'id'), true),
        )

        // Assert
        const expectedActions = [
          setDefaultInstance(),
          setDefaultInstanceSuccess(),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('should call proper actions on fail', async () => {
        // Arrange
        const errorMessage = 'Some Error'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(
          exportInstancesAction(map(instances, 'id'), false),
        )

        // Assert
        const expectedActions = [
          setDefaultInstance(),
          setDefaultInstanceFailure(errorMessage),
          addErrorNotification(responsePayload as AxiosError),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('updateInstance', () => {
      it('call both updateInstance and defaultInstanceChangingSuccess when fetch is successed', async () => {
        // Arrange
        const requestData = {
          id: '123',
          name: 'db',
          host: 'localhost',
          port: 6379,
        }

        const responsePayload = { status: 201 }

        apiService.patch = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(updateInstanceAction(requestData))

        // Assert
        const expectedActions = [
          defaultInstanceChanging(),
          defaultInstanceChangingSuccess(),
        ]

        expect(store.getActions().splice(0, 2)).toEqual(expectedActions)
      })

      it('call both updateInstance and defaultInstanceChangingFailure when fetch is fail', async () => {
        // Arrange
        const requestData = {
          id: '123',
          name: 'db',
          host: 'localhost',
          port: 6379,
        }

        const errorMessage =
          'Could not connect to aoeu:123, please check the connection details.'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.patch = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(updateInstanceAction(requestData))

        // Assert
        const expectedActions = [
          defaultInstanceChanging(),
          defaultInstanceChangingFailure(responsePayload.response.data.message),
          addErrorNotification(responsePayload as AxiosError),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('checkConnectToInstance', () => {
      it('call both checkConnectToInstance and setDefaultInstanceSuccess when connection is successed', async () => {
        // Arrange
        const requestId = '123'

        const onSuccessAction = jest.fn()
        const onFailAction = jest.fn()

        const responsePayload = { status: 201 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          checkConnectToInstanceAction(
            requestId,
            onSuccessAction,
            onFailAction,
          ),
        )

        // Assert
        const expectedActions = [
          setDefaultInstance(),
          resetConnectedInstance(),
          setDefaultInstanceSuccess(),
        ]

        expect(store.getActions().splice(0, expectedActions.length)).toEqual(
          expectedActions,
        )
      })

      it('call both checkConnectToInstance and setDefaultInstanceFailure when fetch is fail', async () => {
        // Arrange
        const requestId = '123'

        const onSuccessAction = jest.fn()
        const onFailAction = jest.fn()

        const errorMessage =
          'Could not connect to aoeu:123, please check the connection details.'
        const responsePayload = {
          instanceId: requestId,
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(
          checkConnectToInstanceAction(
            requestId,
            onSuccessAction,
            onFailAction,
          ),
        )

        // Assert
        const expectedActions = [
          setDefaultInstance(),
          resetConnectedInstance(),
          setDefaultInstanceFailure(responsePayload.response.data.message),
          addErrorNotification(responsePayload as IAddInstanceErrorPayload),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('getDatabaseConfigInfoAction', () => {
      it('succeed to get database config info', async () => {
        // Arrange
        const requestId = '123'
        const data = {
          databases: 1,
          server: {},
          modules: [],
          version: '6.52',
        }
        const responsePayload = { status: 200, data }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          getDatabaseConfigInfoAction(requestId, jest.fn()),
        )

        // Assert
        const expectedActions = [
          getDatabaseConfigInfo(),
          getDatabaseConfigInfoSuccess(data),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to get database config info', async () => {
        // Arrange
        const requestId = '123'
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          getDatabaseConfigInfoAction(requestId, jest.fn(), jest.fn()),
        )

        // Assert
        const expectedActions = [
          getDatabaseConfigInfo(),
          getDatabaseConfigInfoFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchConnectedInstanceInfoAction', () => {
      it('succeed to get database instance info', async () => {
        // Arrange
        const requestId = '123'
        const data = {
          databases: 12,
          server: {},
          modules: [],
          version: '6.52',
        }
        const responsePayload = { status: 200, data }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          fetchConnectedInstanceInfoAction(requestId, jest.fn()),
        )

        // Assert
        const expectedActions = [
          setConnectedInfoInstance(),
          setConnectedInfoInstanceSuccess(data),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to get database config info', async () => {
        // Arrange
        const requestId = '123'
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          fetchConnectedInstanceInfoAction(requestId, jest.fn()),
        )

        // Assert
        const expectedActions = [setConnectedInfoInstance()]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('changeInstanceAliasAction', () => {
      const requestPayload = {
        id: 'e37cc441-a4f2-402c-8bdb-fc2413cbbaff',
        name: 'newAlias',
      }
      it('succeed to change database alias', async () => {
        // Arrange
        const data = {
          oldName: 'databaseAlias',
          newName: 'newAlias',
        }
        const responsePayload = { status: 200, data }
        apiService.patch = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          changeInstanceAliasAction(requestPayload.id, requestPayload.name),
        )

        // Assert
        const expectedActions = [
          changeInstanceAlias(),
          changeInstanceAliasSuccess(requestPayload),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
      it('failed to change database alias', async () => {
        // Arrange
        const errorMessage = 'Not Found!'
        const responsePayload = {
          response: {
            status: 404,
            data: { message: errorMessage },
          },
        }
        apiService.patch = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          changeInstanceAliasAction(requestPayload.id, requestPayload.name),
        )

        // Assert
        const expectedActions = [
          changeInstanceAlias(),
          changeInstanceAliasFailure(errorMessage),
          addErrorNotification(responsePayload as AxiosError),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchEditedInstanceAction', () => {
      it('call both setEditedInstance and setDefaultInstanceSuccess when fetch is successed', async () => {
        // Arrange
        const editedInstance = {
          id: 'instanceId',
          host: '1',
          port: 1,
          modules: [],
        }
        const data = instances[1]
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchEditedInstanceAction(editedInstance))

        // Assert
        const expectedActions = [
          setDefaultInstance(),
          setEditedInstance(editedInstance),
          updateEditedInstance(responsePayload.data),
          setDefaultInstanceSuccess(),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('call both setDefaultInstance and setDefaultInstanceFailure when fetch is fail', async () => {
        // Arrange
        const editedInstance = {
          id: 'instanceId',
          host: '1',
          port: 1,
          modules: [],
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
        await store.dispatch<any>(fetchEditedInstanceAction(editedInstance))

        // Assert
        const expectedActions = [
          setDefaultInstance(),
          setEditedInstance(editedInstance),
          setEditedInstance(null),
          setConnectedInstanceFailure(),
          setDefaultInstanceFailure(responsePayload.response.data.message),
          addErrorNotification(responsePayload as AxiosError),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('checkDatabaseIndexAction', () => {
      it('should call proper actions on success', async () => {
        // Arrange
        const id = 'instanceId'
        const index = 3
        const responsePayload = { status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(checkDatabaseIndexAction(id, index))

        // Assert
        const expectedActions = [
          checkDatabaseIndex(),
          checkDatabaseIndexSuccess(index),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('should call proper actions on fail', async () => {
        // Arrange
        const id = 'instanceId'
        const errorMessage = 'some error'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(checkDatabaseIndexAction(id, 3))

        // Assert
        const expectedActions = [
          checkDatabaseIndex(),
          checkDatabaseIndexFailure(),
          addErrorNotification(responsePayload as AxiosError),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('uploadInstancesFile', () => {
      it('should call proper actions on success', async () => {
        // Arrange
        const formData = new FormData()
        const mockedError = {
          statusCode: 400,
          message: 'message',
          error: 'error',
        }
        const data = {
          total: 3,
          fail: [{ index: 0, status: 'fail', errors: [mockedError] }],
          partial: [{ index: 2, status: 'fail', errors: [mockedError] }],
          success: [
            { index: 1, status: 'success', port: 1233, host: 'localhost' },
          ],
        }

        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(uploadInstancesFile(formData))

        // Assert
        const expectedActions = [
          importInstancesFromFile(),
          importInstancesFromFileSuccess(responsePayload.data),
        ]
        const actions = store.getActions()
        // skip thunk action
        const testActions = [
          ...actions.slice(0, expectedActions.length - 1),
          actions[expectedActions.length],
        ]

        expect(testActions).toEqual(expectedActions)
      })

      it('should call proper actions on fail', async () => {
        // Arrange
        const formData = new FormData()
        const errorMessage = 'Some error'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(uploadInstancesFile(formData))

        // Assert
        const expectedActions = [
          importInstancesFromFile(),
          importInstancesFromFileFailure(responsePayload.response.data.message),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('testInstanceStandaloneAction', () => {
      it('call axios with proper url with id', async () => {
        // Arrange
        const requestData = {
          id: '123',
          name: 'db',
          host: 'localhost',
          port: 6379,
        }

        apiService.post = jest.fn()

        // Act
        await store.dispatch<any>(testInstanceStandaloneAction(requestData))

        expect(apiService.post).toBeCalledWith(
          'databases/test/123',
          omit(requestData, 'id'),
        )
      })

      it('call axios with proper url with id', async () => {
        // Arrange
        const requestData = {
          name: 'db',
          host: 'localhost',
          port: 6379,
        }

        apiService.post = jest.fn()

        // Act
        await store.dispatch<any>(testInstanceStandaloneAction(requestData))

        expect(apiService.post).toBeCalledWith('databases/test', requestData)
      })

      it('call proper actions on success', async () => {
        // Arrange
        const requestData = {
          id: '123',
          name: 'db',
          host: 'localhost',
          port: 6379,
        }

        const responsePayload = { status: 201 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(testInstanceStandaloneAction(requestData))

        // Assert
        const expectedActions = [
          testConnection(),
          testConnectionSuccess(),
          addMessageNotification(successMessages.TEST_CONNECTION()),
        ]

        expect(store.getActions().splice(0, 3)).toEqual(expectedActions)
      })

      it('should call proper actions on fail', async () => {
        // Arrange
        const requestData = {
          id: '123',
          name: 'db',
          host: 'localhost',
          port: 6379,
        }

        const errorMessage = 'some error'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(testInstanceStandaloneAction(requestData))

        // Assert
        const expectedActions = [
          testConnection(),
          testConnectionFailure(responsePayload.response.data.message),
          addErrorNotification(responsePayload as AxiosError),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('autoCreateAndConnectToInstanceAction', () => {
      it('call proper actions on success', async () => {
        // Arrange
        const mockId = '123'
        const mockName = 'name'
        const requestData = {
          name: mockName,
          host: 'localhost',
          port: 6379,
        }

        const responsePayload = {
          status: 201,
          data: { id: mockId, name: mockName },
        }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          autoCreateAndConnectToInstanceAction(requestData),
        )

        // Assert
        const expectedActions = [
          addInfiniteNotification(INFINITE_MESSAGES.AUTO_CREATING_DATABASE()),
          resetKeys(),
          setAppContextInitialState(),
          setConnectedInstanceId(mockId),
          setDefaultInstance(),
          resetConnectedInstance(),
        ]

        expect(store.getActions().slice(0, expectedActions.length)).toEqual(
          expectedActions,
        )
      })

      it('should call proper actions on fail with errorCode=11_200 (Database already exists)', async () => {
        // Arrange
        const mockId = '123'
        const mockName = 'name'
        const requestData = {
          name: mockName,
          host: 'localhost',
          port: 6379,
        }

        const errorMessage = 'some error'
        const responsePayload = {
          response: {
            status: 500,
            data: {
              message: errorMessage,
              errorCode: CustomErrorCodes.DatabaseAlreadyExists,
              resource: {
                databaseId: mockId,
              },
            },
          },
        }

        apiService.post = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(
          autoCreateAndConnectToInstanceAction(requestData),
        )

        // Assert
        const expectedActions = [
          addInfiniteNotification(INFINITE_MESSAGES.AUTO_CREATING_DATABASE()),
          resetKeys(),
          setAppContextInitialState(),
          setConnectedInstanceId(mockId),
          setDefaultInstance(),
          resetConnectedInstance(),
        ]
        expect(store.getActions().slice(0, expectedActions.length)).toEqual(
          expectedActions,
        )
      })
    })

    describe('cloneInstanceAction', () => {
      it('call proper actions on success', async () => {
        // Arrange
        const mockId = '123'
        const mockName = 'name'
        const requestData = {
          id: mockId,
          name: mockName,
          timeout: 45_000,
        }

        const responsePayload = { status: 201, data: { name: mockName } }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(cloneInstanceAction(requestData))

        // Assert
        const expectedActions = [
          defaultInstanceChanging(),
          defaultInstanceChangingSuccess(),
          loadInstances(),
          addMessageNotification(
            successMessages.ADDED_NEW_INSTANCE(requestData.name),
          ),
        ]

        expect(store.getActions().slice(0, expectedActions.length)).toEqual(
          expectedActions,
        )
      })
      it('call both createInstanceStandaloneAction and defaultInstanceChangingFailure when fetch is fail', async () => {
        // Arrange
        const requestData = {
          name: 'db',
          host: 'localhost',
          port: 6379,
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
        await store.dispatch<any>(cloneInstanceAction(requestData, () => ({})))

        // Assert
        const expectedActions = [
          defaultInstanceChanging(),
          defaultInstanceChangingFailure(responsePayload.response.data.message),
          addErrorNotification(responsePayload as AxiosError),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
