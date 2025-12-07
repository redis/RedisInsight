import { AxiosError } from 'axios'
import { cloneDeep } from 'lodash'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import { apiService } from 'uiSrc/services'
import { parseAddedMastersSentinel, parseMastersSentinel } from 'uiSrc/utils'

import { SentinelMaster } from 'apiSrc/modules/redis-sentinel/models/sentinel-master'
import { CreateSentinelDatabaseResponse } from 'apiSrc/modules/redis-sentinel/dto/create.sentinel.database.response'

import reducer, {
  initialState,
  sentinelSelector,
  loadMastersSentinel,
  loadMastersSentinelSuccess,
  loadMastersSentinelFailure,
  fetchMastersSentinelAction,
  setInstanceSentinel,
  createMastersSentinelAction,
  createMastersSentinelSuccess,
  createMastersSentinel,
  createMastersSentinelFailure,
  updateMastersSentinel,
} from '../../instances/sentinel'
import { addErrorNotification } from '../../app/notifications'
import { LoadedSentinel, ModifiedSentinelMaster } from '../../interfaces'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
}))

let store: typeof mockedStore
let masters: SentinelMaster[]
let parsedMasters: ModifiedSentinelMaster[]
let parsedAddedMasters: ModifiedSentinelMaster[]
let addedMastersStatuses: CreateSentinelDatabaseResponse[]

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()

  masters = [
    {
      host: '127.0.0.1',
      port: 6379,
      name: 'mymaster-2',
      numberOfSlaves: 1,
      nodes: [{ host: 'localhost', port: 5005 }],
    },
    {
      host: '127.0.0.1',
      port: 6379,
      name: 'mymaster',
      numberOfSlaves: 0,
      nodes: [
        { host: 'localhost', port: 5005 },
        { host: '127.0.0.1', port: 5006 },
      ],
    },
  ]

  addedMastersStatuses = [
    {
      id: 'ce935f36-057a-40a6-a796-4045e4b123bd',
      name: 'mymaster',
      status: 'success',
      message: 'Added',
    },
    {
      name: 'mymaster-2',
      status: 'fail',
      message: 'Failed to authenticate, please check the username or password.',
      error: {
        statusCode: 401,
        message:
          'Failed to authenticate, please check the username or password.',
        error: 'Unauthorized',
      },
    },
  ]

  parsedMasters = parseMastersSentinel(masters)
  parsedAddedMasters = parseAddedMastersSentinel(
    parsedMasters,
    addedMastersStatuses,
  )
})

describe('sentinel slice', () => {
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

  describe('loadMastersSentinel', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, loadMastersSentinel())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          sentinel: nextState,
        },
      })
      expect(sentinelSelector(rootState)).toEqual(state)
    })
  })

  describe('updateMastersSentinel', () => {
    it('should properly set loading = true', () => {
      // Arrange

      const data: ModifiedSentinelMaster[] = [
        { name: 'mymaster', host: 'localhost', port: 0, numberOfSlaves: 10 },
      ]

      const state = {
        ...initialState,
        data,
      }

      // Act
      const nextState = reducer(initialState, updateMastersSentinel(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          sentinel: nextState,
        },
      })
      expect(sentinelSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMastersSentinelSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const state = {
        ...initialState,
        loading: false,
        data: parsedMasters,
        loaded: {
          ...initialState.loaded,
          [LoadedSentinel.Masters]: true,
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        loadMastersSentinelSuccess(masters),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          sentinel: nextState,
        },
      })
      expect(sentinelSelector(rootState)).toEqual(state)
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
          [LoadedSentinel.Masters]: true,
        },
      }

      // Act
      const nextState = reducer(initialState, loadMastersSentinelSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          sentinel: nextState,
        },
      })
      expect(sentinelSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMastersSentinelFailure', () => {
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
      const nextState = reducer(initialState, loadMastersSentinelFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          sentinel: nextState,
        },
      })
      expect(sentinelSelector(rootState)).toEqual(state)
    })
  })

  describe('createMastersSentinel', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, createMastersSentinel())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          sentinel: nextState,
        },
      })
      expect(sentinelSelector(rootState)).toEqual(state)
    })
  })

  describe('createMastersSentinelSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const state = {
        ...initialState,
        loading: false,
        data: parsedAddedMasters,
        statuses: addedMastersStatuses,
        loaded: {
          ...initialState.loaded,
          [LoadedSentinel.MastersAdded]: true,
        },
      }

      // Act
      const nextState = reducer(
        { ...initialState, data: parsedMasters },
        createMastersSentinelSuccess(addedMastersStatuses),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          sentinel: nextState,
        },
      })
      expect(sentinelSelector(rootState)).toEqual(state)
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
          [LoadedSentinel.MastersAdded]: true,
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        createMastersSentinelSuccess(data),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          sentinel: nextState,
        },
      })
      expect(sentinelSelector(rootState)).toEqual(state)
    })
  })

  describe('createMastersSentinelFailure', () => {
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
      const nextState = reducer(
        initialState,
        createMastersSentinelFailure(data),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          sentinel: nextState,
        },
      })
      expect(sentinelSelector(rootState)).toEqual(state)
    })
  })

  describe('thunks', () => {
    it('call both fetchMastersSentinelAction and loadMastersSentinelSuccess when fetch is successed', async () => {
      // Arrange
      const requestData = {
        host: 'localhost',
        port: 5005,
      }

      const responsePayload = { data: masters, status: 200 }

      apiService.post = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(fetchMastersSentinelAction(requestData))

      // Assert
      const expectedActions = [
        loadMastersSentinel(),
        setInstanceSentinel(requestData),
        loadMastersSentinelSuccess(responsePayload.data),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })

    it('call both fetchMastersSentinelAction and loadMastersSentinelFailure when fetch is fail', async () => {
      // Arrange
      const requestData = {
        host: 'localhost',
        port: 5005,
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
      await store.dispatch<any>(fetchMastersSentinelAction(requestData))

      // Assert
      const expectedActions = [
        loadMastersSentinel(),
        loadMastersSentinelFailure(responsePayload.response.data.message),
        addErrorNotification(responsePayload as AxiosError),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })
  })

  it('call both createMastersSentinelAction and createMastersSentinelSuccess when fetch is successed', async () => {
    // Arrange
    const requestData = [
      {
        alias: 'db test1',
        name: 'mymaster',
      },
      {
        alias: 'db test2',
        name: 'mymaster-2',
        username: 'egor',
        password: '123',
      },
    ]

    const responsePayload = { data: addedMastersStatuses, status: 200 }

    apiService.post = jest.fn().mockResolvedValue(responsePayload)

    // Act
    await store.dispatch<any>(createMastersSentinelAction(requestData))

    // Assert
    const expectedActions = [
      createMastersSentinel(),
      createMastersSentinelSuccess(responsePayload.data),
    ]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('call both createMastersSentinelAction and createMastersSentinelFailure when fetch is fail', async () => {
    // Arrange
    const requestData = [
      {
        alias: 'db test1',
        name: 'mymaster',
      },
      {
        alias: 'db test2',
        name: 'mymaster-2',
        username: 'egor',
        password: '123',
      },
    ]

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
    await store.dispatch<any>(createMastersSentinelAction(requestData))

    // Assert
    const expectedActions = [
      createMastersSentinel(),
      createMastersSentinelFailure(responsePayload.response.data.message),
      addErrorNotification(responsePayload as AxiosError),
    ]
    expect(store.getActions()).toEqual(expectedActions)
  })
})
