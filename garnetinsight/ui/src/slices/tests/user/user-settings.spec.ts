import { cloneDeep } from 'lodash'
import { AxiosError } from 'axios'

import { apiService } from 'uiSrc/services'
import {
  cleanup,
  mockedStore,
  initialStateDefault,
} from 'uiSrc/utils/test-utils'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'

import reducer, {
  initialState,
  setUserSettingsInitialState,
  setSettingsPopupState,
  getUserConfigSettings,
  getUserConfigSettingsSuccess,
  getUserConfigSettingsFailure,
  updateUserConfigSettings,
  updateUserConfigSettingsSuccess,
  updateUserConfigSettingsFailure,
  getUserSettingsSpec,
  getUserSettingsSpecSuccess,
  getUserSettingsSpecFailure,
  fetchUserConfigSettings,
  fetchUserSettingsSpec,
  updateUserConfigSettingsAction,
  userSettingsSelector,
} from '../../user/user-settings'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('userSettings slice', () => {
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

  describe('setUserSettingsInitialState', () => {
    it('should properly set the initial state', () => {
      // Arrange
      const state = {
        ...initialState,
      }

      // Act
      const nextState = reducer(initialState, setUserSettingsInitialState())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        user: { settings: nextState },
      })
      expect(userSettingsSelector(rootState)).toEqual(state)
    })

    it('Cleanup should properly be "true" in the initial state', () => {
      // Arrange
      const state = {
        ...initialState,
        workbench: {
          ...initialState.workbench,
          cleanup: true,
        },
      }

      // Act
      const nextState = reducer(initialState, setUserSettingsInitialState())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        user: { settings: nextState },
      })
      expect(userSettingsSelector(rootState)).toEqual(state)
    })
  })

  describe('setSettingsPopupState', () => {
    it('should properly set the state', () => {
      // Arrange
      const state = {
        ...initialState,
        isShowConceptsPopup: true,
      }

      // Act
      const nextState = reducer(initialState, setSettingsPopupState(true))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        user: { settings: nextState },
      })
      expect(userSettingsSelector(rootState)).toEqual(state)
    })
  })

  describe('getUserConfigSettings', () => {
    it('should properly set the state before fetch', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, getUserConfigSettings())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        user: { settings: nextState },
      })
      expect(userSettingsSelector(rootState)).toEqual(state)
    })
  })

  describe('getUserConfigSettingsSuccess', () => {
    it('should properly set the state after fetch the data', () => {
      // Arrange
      const data = {
        agreements: {
          eula: true,
        },
      }
      const state = {
        ...initialState,
        loading: false,
        config: data,
      }

      // Act
      const nextState = reducer(
        initialState,
        getUserConfigSettingsSuccess(data),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        user: { settings: nextState },
      })
      expect(userSettingsSelector(rootState)).toEqual(state)
    })
  })

  describe('getUserConfigSettingsFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const error = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error,
      }

      // Act
      const nextState = reducer(
        initialState,
        getUserConfigSettingsFailure(error),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        user: { settings: nextState },
      })
      expect(userSettingsSelector(rootState)).toEqual(state)
    })
  })

  describe('updateUserConfigSettings', () => {
    it('should properly set the state before fetch', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, updateUserConfigSettings())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        user: { settings: nextState },
      })
      expect(userSettingsSelector(rootState)).toEqual(state)
    })
  })

  describe('updateUserConfigSettingsSuccess', () => {
    it('should properly set the state after fetch the data', () => {
      // Arrange

      const config = {
        agreements: {
          eula: true,
        },
      }
      const state = {
        ...initialState,
        loading: false,
        isShowConceptsPopup: false,
        config,
      }

      // Act
      const nextState = reducer(
        initialState,
        updateUserConfigSettingsSuccess(config),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        user: { settings: nextState },
      })
      expect(userSettingsSelector(rootState)).toEqual(state)
    })
  })

  describe('updateUserConfigSettingsFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const error = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error,
      }

      // Act
      const nextState = reducer(
        initialState,
        updateUserConfigSettingsFailure(error),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        user: { settings: nextState },
      })
      expect(userSettingsSelector(rootState)).toEqual(state)
    })
  })

  describe('getUserSettingsSpec', () => {
    it('should properly set the state before fetch', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, getUserSettingsSpec())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        user: { settings: nextState },
      })
      expect(userSettingsSelector(rootState)).toEqual(state)
    })
  })

  describe('getUserSettingsSpecSuccess', () => {
    it('should properly set the state after fetch the data', () => {
      // Arrange
      const data = {
        version: '1.0.0',
        agreements: {
          eula: {
            defaultValue: false,
            required: true,
            editable: false,
            since: '1.0.0',
            title: 'Title',
            label: '<a>Text</a>',
          },
        },
      }
      const state = {
        ...initialState,
        loading: false,
        spec: data,
      }

      // Act
      const nextState = reducer(initialState, getUserSettingsSpecSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        user: { settings: nextState },
      })
      expect(userSettingsSelector(rootState)).toEqual(state)
    })
  })

  describe('getUserSettingsSpecFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const error = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error,
      }

      // Act
      const nextState = reducer(initialState, getUserSettingsSpecFailure(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        user: { settings: nextState },
      })
      expect(userSettingsSelector(rootState)).toEqual(state)
    })
  })

  // thunks

  describe('thunks', () => {
    describe('fetchUserConfigSettings', () => {
      it('succeed to fetch data', async () => {
        // Arrange
        const data = {
          agreements: {
            eula: true,
            analytics: false,
          },
        }
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchUserConfigSettings())

        // Assert
        const expectedActions = [
          getUserConfigSettings(),
          getUserConfigSettingsSuccess(responsePayload.data),
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
        await store.dispatch<any>(fetchUserConfigSettings())

        // Assert
        const expectedActions = [
          getUserConfigSettings(),
          getUserConfigSettingsFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchUserSettingsSpec', () => {
      it('succeed to fetch data', async () => {
        // Arrange
        const data = {
          version: '1.0.0',
          agreements: {
            eula: {
              defaultValue: false,
              required: true,
              editable: false,
              since: '1.0.0',
              title: 'Title',
              label: '<a>Text</a>',
            },
          },
        }
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchUserSettingsSpec())

        // Assert
        const expectedActions = [
          getUserSettingsSpec(),
          getUserSettingsSpecSuccess(responsePayload.data),
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
        await store.dispatch<any>(fetchUserSettingsSpec())

        // Assert
        const expectedActions = [
          getUserSettingsSpec(),
          getUserSettingsSpecFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('updateUserConfigSettingsAction', () => {
      it('succeed to update settings', async () => {
        // Arrange
        const data = { agreements: { eula: true } }
        const responsePayload = { data, status: 200 }

        apiService.patch = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          updateUserConfigSettingsAction({ agreements: { eula: true } }),
        )

        // Assert
        const expectedActions = [
          updateUserConfigSettings(),
          updateUserConfigSettingsSuccess(data),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to update settings', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.patch = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          updateUserConfigSettingsAction({ agreements: { eula: true } }),
        )

        // Assert
        const expectedActions = [
          updateUserConfigSettings(),
          updateUserConfigSettingsFailure(errorMessage),
          addErrorNotification(responsePayload as AxiosError),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
