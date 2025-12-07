import { cloneDeep } from 'lodash'
import { AxiosError } from 'axios'
import { apiService } from 'uiSrc/services'
import {
  cleanup,
  mockedStore,
  initialStateDefault,
} from 'uiSrc/utils/test-utils'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'

import { DEFAULT_ERROR_MESSAGE } from 'uiSrc/utils'
import {
  CLUSTER_DETAILS_DATA_MOCK,
  INSTANCE_ID_MOCK,
} from 'uiSrc/mocks/handlers/analytics/clusterDetailsHandlers'
import reducer, {
  initialState,
  getClusterDetails,
  getClusterDetailsSuccess,
  getClusterDetailsError,
  clusterDetailsSelector,
  setClusterDetailsInitialState,
  fetchClusterDetailsAction,
} from '../../analytics/clusterDetails'

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('clusterDetails slice', () => {
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
      const nextState = reducer(initialState, setClusterDetailsInitialState())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        analytics: { clusterDetails: nextState },
      })
      expect(clusterDetailsSelector(rootState)).toEqual(state)
    })
  })

  describe('getClusterDetails', () => {
    it('should properly set state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, getClusterDetails())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        analytics: { clusterDetails: nextState },
      })
      expect(clusterDetailsSelector(rootState)).toEqual(state)
    })
  })

  describe('getClusterDetailsSuccess', () => {
    it('should properly set state after success fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: false,
        data: CLUSTER_DETAILS_DATA_MOCK,
      }

      // Act
      const nextState = reducer(
        initialState,
        getClusterDetailsSuccess(CLUSTER_DETAILS_DATA_MOCK),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        analytics: { clusterDetails: nextState },
      })
      expect(clusterDetailsSelector(rootState)).toEqual(state)
    })
  })

  describe('getClusterDetailsError', () => {
    it('should properly set state after failed fetch data', () => {
      // Arrange
      const error = 'Some error'
      const state = {
        ...initialState,
        loading: false,
        error,
      }

      // Act
      const nextState = reducer(initialState, getClusterDetailsError(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        analytics: { clusterDetails: nextState },
      })
      expect(clusterDetailsSelector(rootState)).toEqual(state)
    })
  })

  // thunks

  describe('thunks', () => {
    describe('fetchClusterDetailsAction', () => {
      it('succeed to fetch data', async () => {
        // Act

        const responsePayload = {
          status: 200,
          data: CLUSTER_DETAILS_DATA_MOCK,
        }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        await store.dispatch<any>(fetchClusterDetailsAction(INSTANCE_ID_MOCK))

        // Assert
        const expectedActions = [
          getClusterDetails(),
          getClusterDetailsSuccess(CLUSTER_DETAILS_DATA_MOCK),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch data', async () => {
        const responsePayload = {
          response: {
            status: 500,
            data: { message: DEFAULT_ERROR_MESSAGE },
          },
        }

        apiService.get = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchClusterDetailsAction(INSTANCE_ID_MOCK))

        // Assert
        const expectedActions = [
          getClusterDetails(),
          addErrorNotification(responsePayload as AxiosError),
          getClusterDetailsError(DEFAULT_ERROR_MESSAGE),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
