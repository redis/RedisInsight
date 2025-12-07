import { cloneDeep, flatMap, isEmpty, reject } from 'lodash'
import { apiService } from 'uiSrc/services'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import { IPlugin, PluginsResponse } from 'uiSrc/slices/interfaces'
import reducer, {
  appPluginsSelector,
  getAllPlugins,
  getAllPluginsFailure,
  getAllPluginsSuccess,
  getPluginStateAction,
  initialState,
  loadPluginsAction,
  sendPluginCommandAction,
  setPluginStateAction,
} from '../../app/plugins'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const MOCK_PLUGINS_RESPONSE = {
  static: '/static/resources/plugins',
  plugins: [
    {
      styles: '/static/plugins/redisearch/dist/styles.css',
      main: '/static/plugins/redisearch/dist/index.js',
      name: 'redisearch',
      visualizations: [
        {
          id: 'redisearch',
          name: 'Table',
          activationMethod: 'renderRediSearch',
          matchCommands: ['FT.INFO', 'FT.SEARCH', 'FT.AGGREGATE'],
          iconDark: './dist/table_view_icon_dark.svg',
          iconLight: './dist/table_view_icon_light.svg',
          default: true,
        },
      ],
      internal: true,
      baseUrl: '/static/plugins/redisearch/',
    },
  ],
}

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

  describe('getAllPlugins', () => {
    it('should properly set loading', () => {
      // Arrange
      const loading = true
      const state = {
        ...initialState,
        loading,
      }

      // Act
      const nextState = reducer(initialState, getAllPlugins())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { plugins: nextState },
      })

      expect(appPluginsSelector(rootState)).toEqual(state)
    })
  })

  describe('getAllPluginsSuccess', () => {
    it('should properly set state after success', () => {
      // Arrange
      const data: PluginsResponse = MOCK_PLUGINS_RESPONSE
      const state = {
        ...initialState,
        staticPath: data.static,
        plugins: reject(data?.plugins, isEmpty),
        visualizations: flatMap(
          reject(data?.plugins, isEmpty),
          (plugin: IPlugin) =>
            plugin.visualizations.map((view) => ({
              ...view,
              plugin: {
                name: plugin.name,
                baseUrl: plugin.baseUrl,
                internal: plugin.internal,
                stylesSrc: plugin.styles,
                scriptSrc: plugin.main,
              },
              uniqId: `${plugin.name}__${view.id}`,
            })),
        ),
      }

      // Act
      const nextState = reducer(initialState, getAllPluginsSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { plugins: nextState },
      })

      expect(appPluginsSelector(rootState)).toEqual(state)
    })
  })

  describe('getAllPluginsFailure', () => {
    it('should properly set error', () => {
      // Arrange
      const error = 'error'
      const state = {
        ...initialState,
        loading: false,
        error,
      }

      // Act
      const nextState = reducer(initialState, getAllPluginsFailure(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { plugins: nextState },
      })

      expect(appPluginsSelector(rootState)).toEqual(state)
    })
  })

  // thunks

  describe('loadPluginsAction', () => {
    it('succeed to fetch plugins', async () => {
      // Arrange
      const data = MOCK_PLUGINS_RESPONSE
      const responsePayload = { status: 200, data }

      apiService.get = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(loadPluginsAction())

      // Assert
      const expectedActions = [getAllPlugins(), getAllPluginsSuccess(data)]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })

    it('failed to fetch plugins', async () => {
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
      await store.dispatch<any>(loadPluginsAction())

      // Assert
      const expectedActions = [
        getAllPlugins(),
        getAllPluginsFailure(errorMessage),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })
  })

  describe('sendPluginCommandAction', () => {
    it('succeed to send command', async () => {
      // Arrange
      const data = 'response'
      const onSuccess = jest.fn()
      const responsePayload = { status: 200, data }

      apiService.post = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(
        sendPluginCommandAction({
          command: 'info',
          onSuccessAction: onSuccess,
        }),
      )

      expect(onSuccess).toBeCalledWith(data)
    })

    it('failed to send command', async () => {
      // Arrange
      const onFailed = jest.fn()
      const errorMessage = 'Something was wrong!'
      const responsePayload = {
        response: {
          status: 500,
          data: { message: errorMessage },
        },
      }
      apiService.post = jest.fn().mockRejectedValue(responsePayload)

      // Act
      await store.dispatch<any>(
        sendPluginCommandAction({
          command: 'info',
          onFailAction: onFailed,
        }),
      )

      expect(onFailed).toBeCalledWith(responsePayload)
    })
  })

  describe('getPluginStateAction', () => {
    it('succeed to get plugin state ', async () => {
      // Arrange
      const data = 'response'
      const onSuccess = jest.fn()
      const responsePayload = { status: 200, data }

      apiService.get = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(
        getPluginStateAction({
          visualizationId: '1',
          commandId: '1',
          onSuccessAction: onSuccess,
        }),
      )

      expect(onSuccess).toBeCalledWith(data)
    })

    it('failed to get plugin state', async () => {
      // Arrange
      const onFailed = jest.fn()
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
        getPluginStateAction({
          visualizationId: '1',
          commandId: '1',
          onFailAction: onFailed,
        }),
      )

      expect(onFailed).toBeCalledWith(responsePayload)
    })
  })

  describe('setPluginStateAction', () => {
    it('succeed to set plugin state ', async () => {
      // Arrange
      const data = 'response'
      const onSuccess = jest.fn()
      const responsePayload = { status: 200, data }

      apiService.post = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(
        setPluginStateAction({
          visualizationId: '1',
          commandId: '1',
          pluginState: { info: 'smth' },
          onSuccessAction: onSuccess,
        }),
      )

      expect(onSuccess).toBeCalledWith(data)
    })

    it('failed to set plugin state', async () => {
      // Arrange
      const onFailed = jest.fn()
      const errorMessage = 'Something was wrong!'
      const responsePayload = {
        response: {
          status: 500,
          data: { message: errorMessage },
        },
      }
      apiService.post = jest.fn().mockRejectedValue(responsePayload)

      // Act
      await store.dispatch<any>(
        setPluginStateAction({
          visualizationId: '1',
          commandId: '1',
          pluginState: { info: 'smth' },
          onFailAction: onFailed,
        }),
      )

      expect(onFailed).toBeCalledWith(responsePayload)
    })
  })
})
