import { cloneDeep } from 'lodash'
import { AxiosError } from 'axios'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import reducer, {
  initialState,
  setConnectedInstance,
  setConnectedInstanceSuccess,
  setConnectedInstanceFailure,
  resetConnectedInstance,
  setDefaultInstance,
  setDefaultInstanceSuccess,
  setDefaultInstanceFailure,
  instancesSelector,
  fetchConnectedInstanceAction,
  checkConnectToRdiInstanceAction,
  createInstanceAction,
  defaultInstanceChanging,
  defaultInstanceChangingSuccess,
  defaultInstanceChangingFailure,
  editInstanceAction,
  updateConnectedInstance,
} from 'uiSrc/slices/rdi/instances'
import { apiService } from 'uiSrc/services'
import {
  addErrorNotification,
  addMessageNotification,
  IAddInstanceErrorPayload,
} from 'uiSrc/slices/app/notifications'
import { RdiInstance } from 'uiSrc/slices/interfaces'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { Rdi } from 'apiSrc/modules/rdi/models'

let store: typeof mockedStore

const mockRdiInstance = {
  name: 'name',
  version: '1.2',
  url: 'http://localhost:4000',
}

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('rdi instances slice', () => {
  describe('setConnectedInstance', () => {
    it('should properly set loading=true', () => {
      // Arrange
      const state = {
        ...initialState,
      }
      // Act
      const nextState = reducer(initialState, setConnectedInstance())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        instances: nextState,
      })

      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('setConnectedInstanceSuccess', () => {
    it('should properly set state', () => {
      // Arrange
      const state = {
        ...initialState,
        connectedInstance: mockRdiInstance,
      }

      // Act
      const nextState = reducer(
        initialState,
        setConnectedInstanceSuccess(mockRdiInstance as RdiInstance),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('setConnectedInstanceFailure', () => {
    it('should properly set state', () => {
      // Arrange
      const error = 'error'
      const state = {
        ...initialState,
        connectedInstance: {
          ...initialState.connectedInstance,
          loading: false,
          error,
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        setConnectedInstanceFailure(error),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('setDefaultInstance', () => {
    it('should properly set loading=true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
        error: '',
      }
      // Act
      const nextState = reducer(initialState, setDefaultInstance())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          instances: nextState,
        },
      })

      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('setDefaultInstanceSuccess', () => {
    it('should properly set loading=false', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: false,
      }

      // Act
      const nextState = reducer(initialState, setDefaultInstanceSuccess())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('setDefaultInstanceFailure', () => {
    it('should properly set state', () => {
      // Arrange
      const error = 'error'
      const state = {
        ...initialState,
        loading: false,
        error,
      }

      // Act
      const nextState = reducer(initialState, setDefaultInstanceFailure(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          instances: nextState,
        },
      })
      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  describe('updateConnectedInstance', () => {
    it('should properly update connected instance', () => {
      // Arrange
      const state = {
        ...initialState,
        connectedInstance: {
          ...initialState.connectedInstance,
          ...mockRdiInstance,
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        updateConnectedInstance(mockRdiInstance as Rdi),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          instances: nextState,
        },
      })

      expect(instancesSelector(rootState)).toEqual(state)
    })
  })

  // thunks

  describe('thunks', () => {
    describe('fetchConnectedInstanceAction', () => {
      it('succeed to fetch data', async () => {
        const responsePayload = { data: mockRdiInstance, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchConnectedInstanceAction('123'))

        // Assert
        const expectedActions = [
          setConnectedInstance(),
          setConnectedInstanceSuccess(mockRdiInstance as RdiInstance),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch data', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchConnectedInstanceAction('123'))

        // Assert
        const expectedActions = [
          setConnectedInstance(),
          setConnectedInstanceFailure(errorMessage),
          addErrorNotification(responsePayload as AxiosError),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('createInstanceAction', () => {
      const onSuccess = jest.fn()
      const onFail = jest.fn()
      it('succeed to create data and call success callback', async () => {
        const responsePayload = { data: mockRdiInstance, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)
        apiService.get = jest.fn().mockResolvedValue({ status: 200, data: [] })

        // Act
        await store.dispatch<any>(
          createInstanceAction(mockRdiInstance, onSuccess, onFail),
        )

        // Assert
        const expectedActions = [
          defaultInstanceChanging(),
          defaultInstanceChangingSuccess(),
          addMessageNotification(
            successMessages.ADDED_NEW_RDI_INSTANCE(mockRdiInstance.name),
          ),
        ]

        expect(store.getActions()).toEqual(
          expect.arrayContaining(expectedActions),
        )
        expect(onSuccess).toBeCalledWith(mockRdiInstance)
      })

      it('failed to create data and call onFail callback', async () => {
        const errorMessage = 'Something was wrong!'
        const errorCode = 11403
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage, errorCode },
          },
        }

        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          createInstanceAction(mockRdiInstance, onSuccess, onFail),
        )

        // Assert
        const expectedActions = [
          defaultInstanceChanging(),
          defaultInstanceChangingFailure(errorMessage),
          addErrorNotification(responsePayload as AxiosError),
        ]

        expect(store.getActions()).toEqual(expectedActions)
        expect(onFail).toBeCalledWith(errorCode)
      })
    })

    describe('editInstanceAction', () => {
      it('succeed to edit data and calls a success callback', async () => {
        const onSuccess = jest.fn()
        const responsePayload = { data: mockRdiInstance, status: 200 }

        apiService.patch = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          editInstanceAction('123', mockRdiInstance, onSuccess),
        )

        // Assert
        const expectedActions = [
          defaultInstanceChanging(),
          defaultInstanceChangingSuccess(),
        ]

        expect(store.getActions()).toEqual(
          expect.arrayContaining(expectedActions),
        )
        expect(onSuccess).toBeCalledWith(mockRdiInstance)
      })

      it('failed to edit data', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.patch = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(editInstanceAction('123', mockRdiInstance))

        // Assert
        const expectedActions = [
          defaultInstanceChanging(),
          defaultInstanceChangingFailure(errorMessage),
          addErrorNotification(responsePayload as AxiosError),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('checkConnectToRdiInstanceAction', () => {
      it('succeed to fetch data', async () => {
        const responsePayload = { status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(checkConnectToRdiInstanceAction('123'))

        // Assert
        const expectedActions = [
          setDefaultInstance(),
          setDefaultInstanceSuccess(),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch data', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(checkConnectToRdiInstanceAction('123'))

        // Assert
        const expectedActions = [
          setDefaultInstance(),
          setDefaultInstanceFailure(errorMessage),
          addErrorNotification({
            ...responsePayload,
            instanceId: '123',
          } as IAddInstanceErrorPayload),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
