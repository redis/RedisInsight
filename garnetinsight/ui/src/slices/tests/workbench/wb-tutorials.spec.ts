import { cloneDeep } from 'lodash'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import { IEnablementAreaItem } from 'uiSrc/slices/interfaces'
import { MOCK_TUTORIALS } from 'uiSrc/constants'
import { resourcesService } from 'uiSrc/services'

import reducer, {
  initialState,
  workbenchTutorialsSelector,
  getWBTutorials,
  getWBTutorialsFailure,
  getWBTutorialsSuccess,
  fetchTutorials,
  defaultItems,
} from '../../workbench/wb-tutorials'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('slices', () => {
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

  describe('getWBTutorials', () => {
    it('should properly set loading', () => {
      // Arrange
      const loading = true
      const state = {
        ...initialState,
        loading,
      }

      // Act
      const nextState = reducer(initialState, getWBTutorials())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          tutorials: nextState,
        },
      })

      expect(workbenchTutorialsSelector(rootState)).toEqual(state)
    })
  })

  describe('getWBTutorialsSuccess', () => {
    it('should properly set state after success', () => {
      // Arrange
      const tutorials: IEnablementAreaItem = MOCK_TUTORIALS
      const state = {
        ...initialState,
        items: [tutorials],
      }

      // Act
      const nextState = reducer(initialState, getWBTutorialsSuccess(tutorials))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          tutorials: nextState,
        },
      })

      expect(workbenchTutorialsSelector(rootState)).toEqual(state)
    })
  })

  describe('getWBTutorialsFailure', () => {
    it('should properly set error', () => {
      // Arrange
      const error = 'error'
      const state = {
        ...initialState,
        loading: false,
        items: defaultItems,
        error,
      }

      // Act
      const nextState = reducer(initialState, getWBTutorialsFailure(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          tutorials: nextState,
        },
      })

      expect(workbenchTutorialsSelector(rootState)).toEqual(state)
    })
  })

  // thunks

  describe('fetchTutorials', () => {
    it('succeed to fetch tutorials items', async () => {
      // Arrange
      const data = MOCK_TUTORIALS
      const responsePayload = { status: 200, data }

      resourcesService.get = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(fetchTutorials(jest.fn()))

      // Assert
      const expectedActions = [getWBTutorials(), getWBTutorialsSuccess(data)]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })

    it('failed to fetch tutorials items', async () => {
      // Arrange
      const errorMessage = 'Something was wrong!'
      const responsePayload = {
        response: {
          status: 500,
          data: { message: errorMessage },
        },
      }
      resourcesService.get = jest.fn().mockRejectedValue(responsePayload)

      // Act
      await store.dispatch<any>(fetchTutorials())

      // Assert
      const expectedActions = [
        getWBTutorials(),
        getWBTutorialsFailure(errorMessage),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })
  })
})
