import { AxiosError } from 'axios'
import { cloneDeep } from 'lodash'
import { apiService } from 'uiSrc/services'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import reducer, {
  initialState,
  loadClientCerts,
  loadClientCertsSuccess,
  loadClientCertsFailure,
  clientCertsSelector,
  fetchClientCerts,
  deleteClientCert,
  deleteClientCertSuccess,
  deleteClientCertFailure,
  deleteClientCertAction,
} from '../../instances/clientCerts'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('clientCerts slice', () => {
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

  describe('deleteClientCert', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, deleteClientCert())

      const rootState = Object.assign(initialStateDefault, {
        connections: {
          clientCerts: nextState,
        },
      })
      expect(clientCertsSelector(rootState)).toEqual(state)
    })
  })

  describe('loadClientCerts', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, loadClientCerts())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          clientCerts: nextState,
        },
      })
      expect(clientCertsSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteClientCertSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: false,
      }

      // Act
      const nextState = reducer(initialState, deleteClientCertSuccess())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          clientCerts: nextState,
        },
      })
      expect(clientCertsSelector(rootState)).toEqual(state)
    })
  })

  describe('loadClientCertsSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const data = [
        { id: '70b95d32-c19d-4311-bb24-e684af12cf15', name: 'client cert' },
      ]
      const state = {
        ...initialState,
        loading: false,
        data,
      }

      // Act
      const nextState = reducer(initialState, loadClientCertsSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          clientCerts: nextState,
        },
      })
      expect(clientCertsSelector(rootState)).toEqual(state)
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
      const nextState = reducer(initialState, loadClientCertsSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          clientCerts: nextState,
        },
      })
      expect(clientCertsSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteClientCertFailure', () => {
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
      const nextState = reducer(initialState, deleteClientCertFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          clientCerts: nextState,
        },
      })
      expect(clientCertsSelector(rootState)).toEqual(state)
    })
  })

  describe('loadClientCertsFailure', () => {
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
      const nextState = reducer(initialState, loadClientCertsFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          clientCerts: nextState,
        },
      })
      expect(clientCertsSelector(rootState)).toEqual(state)
    })
  })

  describe('thunks', () => {
    it('call both fetchClientCerts and loadClientCertsSuccess when fetch is successed', async () => {
      // Arrange
      const data = [
        { id: '70b95d32-c19d-4311-bb24-e684af12cf15', name: 'ca cert' },
      ]
      const responsePayload = { data, status: 200 }

      apiService.get = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(fetchClientCerts())

      // Assert
      const expectedActions = [
        loadClientCerts(),
        loadClientCertsSuccess(responsePayload.data),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })

    it('call both fetchClientCerts and deleteClientCertSuccess when delete is successed', async () => {
      // Arrange delete
      const responsePayload = { status: 200 }
      apiService.delete = jest.fn().mockResolvedValue(responsePayload)

      // Arrange fetch
      const data = [
        { id: '70b95d32-c19d-4311-bb24-e684af12cf15', name: 'client cert' },
      ]
      const fetchResponsePayload = { data, status: 200 }
      apiService.get = jest.fn().mockResolvedValue(fetchResponsePayload)

      // mock function for onSuccessAction
      const onSuccessAction = jest.fn()

      const id = '70b95d32-c19d-4311-bb24-e684af12cf15'

      // Act
      await store.dispatch<any>(deleteClientCertAction(id, onSuccessAction))

      // Assert onSuccessAction
      expect(onSuccessAction).toBeCalled()

      // Assert
      const expectedActions = [
        deleteClientCertSuccess(),
        loadClientCerts(),
        loadClientCertsSuccess(fetchResponsePayload.data),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })

    it('call both fetchClientCerts and deleteClientCertFailure when delete is failed', async () => {
      // Arrange delete
      const error = 'some error'
      const responsePayload = {
        response: { data: { message: error }, status: 500 },
      }
      apiService.delete = jest.fn().mockRejectedValueOnce(responsePayload)

      const onSuccessAction = jest.fn()
      const id = '70b95d32-c19d-4311-bb24-e684af12cf15'

      // Act
      await store.dispatch<any>(deleteClientCertAction(id, onSuccessAction))

      // assert that onSuccessAction is not called
      expect(onSuccessAction).not.toBeCalled()

      // Assert
      const expectedActions = [
        addErrorNotification(responsePayload as AxiosError),
        deleteClientCertFailure(responsePayload.response.data.message),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })
  })
})
