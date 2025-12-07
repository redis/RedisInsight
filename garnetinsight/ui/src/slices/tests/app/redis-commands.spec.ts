import { cloneDeep, uniqBy } from 'lodash'
import set from 'lodash/set'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import { getConfig } from 'uiSrc/config'
import { apiService, resourcesService } from 'uiSrc/services'
import { ICommand, MOCK_COMMANDS_SPEC } from 'uiSrc/constants'
import reducer, {
  initialState,
  getRedisCommands,
  getRedisCommandsFailure,
  getRedisCommandsSuccess,
  appRedisCommandsSelector,
  fetchRedisCommandsInfo,
  commands,
} from '../../app/redis-commands'

const riConfig = getConfig()

const mockConfig = (useLocalResources = false) => {
  set(riConfig, 'app.useLocalResources', useLocalResources)
}

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  mockConfig()
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

  describe('getRedisCommands', () => {
    it('should properly set loading', () => {
      // Arrange
      const loading = true
      const state = {
        ...initialState,
        loading,
      }

      // Act
      const nextState = reducer(initialState, getRedisCommands())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { redisCommands: nextState },
      })

      expect(appRedisCommandsSelector(rootState)).toEqual(state)
    })
  })

  describe('getRedisCommandsSuccess', () => {
    it('should properly set state after success', () => {
      // Arrange
      const data = MOCK_COMMANDS_SPEC
      const state = {
        ...initialState,
        spec: data,
        commandsArray: Object.keys(data).sort(),
        commandGroups: uniqBy(Object.values(data), 'group').map(
          (item: ICommand) => item.group,
        ),
      }

      // Act
      const nextState = reducer(initialState, getRedisCommandsSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { redisCommands: nextState },
      })

      expect(appRedisCommandsSelector(rootState)).toEqual(state)
    })
  })

  describe('getRedisCommandsFailure', () => {
    it('should properly set error', () => {
      // Arrange
      const error = 'error'
      const state = {
        ...initialState,
        loading: false,
        error,
      }

      // Act
      const nextState = reducer(initialState, getRedisCommandsFailure(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { redisCommands: nextState },
      })

      expect(appRedisCommandsSelector(rootState)).toEqual(state)
    })
  })

  // thunks

  describe('fetchRedisCommandsInfo', () => {
    it('succeed to fetch redis commands', async () => {
      // Arrange
      const data = MOCK_COMMANDS_SPEC
      const responsePayload = { status: 200, data }

      apiService.get = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(fetchRedisCommandsInfo(jest.fn()))

      // Assert
      const expectedActions = [
        getRedisCommands(),
        getRedisCommandsSuccess(data),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })

    it('failed to fetch server info', async () => {
      // Arrange
      const errorMessage = 'Something was wrong!'
      const responsePayload = {
        response: {
          status: 500,
          data: { message: errorMessage },
        },
      }
      apiService.get = jest.fn().mockRejectedValue(responsePayload)

      // Act
      await store.dispatch<any>(fetchRedisCommandsInfo(jest.fn(), jest.fn()))

      // Assert
      const expectedActions = [
        getRedisCommands(),
        getRedisCommandsFailure(errorMessage),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })

    it('successfully fetches all local commands', async () => {
      mockConfig(true)
      let expectedResult = {}
      const onSuccessAction = jest.fn()
      const onFailAction = jest.fn()
      const resourceGetSpy = jest.spyOn(resourcesService, 'get')

      commands.forEach((command) => {
        expectedResult = { ...expectedResult, [command]: {} }
        resourceGetSpy.mockResolvedValueOnce({
          status: 200,
          data: { [command]: {} },
        })
      })

      // Act
      await store.dispatch<any>(
        fetchRedisCommandsInfo(onSuccessAction, onFailAction),
      )

      // Assert
      const expectedActions = [
        getRedisCommands(),
        getRedisCommandsSuccess(expectedResult),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
      expect(onSuccessAction).toHaveBeenCalledTimes(1)
      expect(onFailAction).not.toHaveBeenCalled()
    })

    it('handles local commands fetch failures', async () => {
      let expectedResult = {}
      const onSuccessAction = jest.fn()
      const onFailAction = jest.fn()
      const resourceGetSpy = jest.spyOn(resourcesService, 'get')
      const errorMessage = 'Something was wrong!'

      commands.slice(0, -1).forEach((command) => {
        expectedResult = { ...expectedResult, [command]: {} }
        resourceGetSpy.mockResolvedValueOnce({
          status: 200,
          data: { [command]: {} },
        })
      })
      resourceGetSpy.mockRejectedValueOnce({
        status: 500,
        data: { message: errorMessage },
      })

      // Act
      await store.dispatch<any>(
        fetchRedisCommandsInfo(onSuccessAction, onFailAction),
      )

      // Assert
      const expectedActions = [
        getRedisCommands(),
        getRedisCommandsFailure(errorMessage),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
      expect(onFailAction).toHaveBeenCalledTimes(1)
      expect(onSuccessAction).not.toHaveBeenCalled()
    })
  })
})
