import { AxiosError } from 'axios'
import { cloneDeep } from 'lodash'
import { apiService } from 'uiSrc/services'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import reducer, {
  initialState,
  loadCaCerts,
  loadCaCertsSuccess,
  loadCaCertsFailure,
  caCertsSelector,
  fetchCaCerts,
  deleteCaCertificate,
  deleteCaCertificateSuccess,
  deleteCaCertificateFailure,
  deleteCaCertificateAction,
} from '../../instances/caCerts'
import { addErrorNotification } from '../../app/notifications'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('caCerts slice', () => {
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

  describe('deleteCaCertificate', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, deleteCaCertificate())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          caCerts: nextState,
        },
      })
      expect(caCertsSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteCaCertificateSuccess', () => {
    it('should properly set the state with fetched data', () => {
      const state = {
        ...initialState,
        loading: false,
        data: [],
      }

      // Act
      const nextState = reducer(initialState, deleteCaCertificateSuccess())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          caCerts: nextState,
        },
      })
      expect(caCertsSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteCaCertificateFailure', () => {
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
      const nextState = reducer(initialState, deleteCaCertificateFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          caCerts: nextState,
        },
      })
      expect(caCertsSelector(rootState)).toEqual(state)
    })
  })

  describe('loadCaCerts', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, loadCaCerts())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          caCerts: nextState,
        },
      })
      expect(caCertsSelector(rootState)).toEqual(state)
    })
  })

  describe('loadCaCertsSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const data = [
        { id: '70b95d32-c19d-4311-bb24-e684af12cf15', name: 'ca cert' },
      ]
      const state = {
        ...initialState,
        loading: false,
        data,
      }

      // Act
      const nextState = reducer(initialState, loadCaCertsSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          caCerts: nextState,
        },
      })
      expect(caCertsSelector(rootState)).toEqual(state)
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
      const nextState = reducer(initialState, loadCaCertsSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          caCerts: nextState,
        },
      })
      expect(caCertsSelector(rootState)).toEqual(state)
    })
  })

  describe('loadCaCertsFailure', () => {
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
      const nextState = reducer(initialState, loadCaCertsFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          caCerts: nextState,
        },
      })
      expect(caCertsSelector(rootState)).toEqual(state)
    })
  })

  describe('thunks', () => {
    it('call both fetchCaCerts and loadCaCertsSuccess when fetch is successed', async () => {
      // Arrange
      const data = [
        { id: '70b95d32-c19d-4311-bb24-e684af12cf15', name: 'ca cert' },
      ]
      const responsePayload = { data, status: 200 }

      apiService.get = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(fetchCaCerts())

      // Assert
      const expectedActions = [
        loadCaCerts(),
        loadCaCertsSuccess(responsePayload.data),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })

    it('call both fetchCaCerts and deleteCaCertificateSuccess when delete ca certificate action is successed', async () => {
      // Arrange
      const responsePayload = { status: 200 }
      apiService.delete = jest.fn().mockResolvedValue(responsePayload)

      // Arrange
      const data = [
        { id: '70b95d32-c19d-4311-bb24-e684af12cf15', name: 'ca cert' },
      ]
      const fetchResponsePayload = { data, status: 200 }

      apiService.get = jest.fn().mockResolvedValue(fetchResponsePayload)

      // mock function for onSuccessAction
      const onSuccessAction = jest.fn()

      const id = '70b95d32-c19d-4311-bb24-e684af12cf15'

      // Act
      await store.dispatch<any>(deleteCaCertificateAction(id, onSuccessAction))

      // assert that onSuccessAction is called
      expect(onSuccessAction).toBeCalled()

      // Assert
      const expectedActions = [
        deleteCaCertificate(id),
        deleteCaCertificateSuccess(),
        loadCaCerts(),
        loadCaCertsSuccess(fetchResponsePayload.data),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })

    it('call both fetchCaCerts and deleteCaCertificateFailure when delete ca certificate action is failed', async () => {
      // Arrange
      const errorMessage =
        'Could not connect to aoeu:123, please check the connection details.'
      const responsePayload = {
        response: {
          status: 500,
          data: { message: errorMessage },
        },
      }

      apiService.delete = jest.fn().mockRejectedValueOnce(responsePayload)

      // mock function for onSuccessAction
      const onSuccessAction = jest.fn()

      const id = '70b95d32-c19d-4311-bb24-e684af12cf15'

      // Act
      await store.dispatch<any>(deleteCaCertificateAction(id, onSuccessAction))

      // assert that onSuccessAction is not called
      expect(onSuccessAction).not.toBeCalled()

      // Assert
      const expectedActions = [
        deleteCaCertificate(id),
        addErrorNotification(responsePayload as AxiosError),
        deleteCaCertificateFailure(responsePayload.response.data.message),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })

    it('call both fetchCaCerts and loadCaCertsFailure when fetch is fail', async () => {
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
      await store.dispatch<any>(fetchCaCerts())

      // Assert
      const expectedActions = [
        loadCaCerts(),
        addErrorNotification(responsePayload as AxiosError),
        loadCaCertsFailure(responsePayload.response.data.message),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })
  })
})
