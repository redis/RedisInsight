import { cloneDeep } from 'lodash'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'

import { UrlHandlingActions } from 'uiSrc/slices/interfaces/urlHandling'
import reducer, {
  initialState,
  setUrlHandlingInitialState,
  setFromUrl,
  setUrlDbConnection,
  setUrlProperties,
  appRedirectionSelector,
} from '../../app/url-handling'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('urlHandling slice', () => {
  describe('setUrlHandlingInitialState', () => {
    it('should properly set initial state', () => {
      const nextState = reducer(initialState, setUrlHandlingInitialState())
      const rootState = Object.assign(initialStateDefault, {
        app: { urlHandling: nextState },
      })
      expect(appRedirectionSelector(rootState)).toEqual(initialState)
    })
  })

  describe('setFromUrl', () => {
    it('should properly set state', () => {
      // Arrange
      const payload = 'any-string'

      const state = {
        ...initialState,
        fromUrl: payload,
      }

      // Act
      const nextState = reducer(initialState, setFromUrl(payload))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { urlHandling: nextState },
      })
      expect(appRedirectionSelector(rootState)).toEqual(state)
    })
  })

  describe('setUrlDbConnection', () => {
    it('should properly set state', () => {
      // Arrange
      const payload = {
        action: UrlHandlingActions.Connect,
        dbConnection: {
          name: 'dbName',
          host: 'localhost',
          port: 6379,
        },
      }

      const state = {
        ...initialState,
        ...payload,
      }

      // Act
      const nextState = reducer(initialState, setUrlDbConnection(payload))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { urlHandling: nextState },
      })
      expect(appRedirectionSelector(rootState)).toEqual(state)
    })
  })

  describe('setUrlProperties', () => {
    it('should properly set state', () => {
      // Arrange
      const payload = {
        property1: '123',
        property2: 'zx',
      }

      const state = {
        ...initialState,
        properties: payload,
      }

      // Act
      const nextState = reducer(initialState, setUrlProperties(payload))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { urlHandling: nextState },
      })
      expect(appRedirectionSelector(rootState)).toEqual(state)
    })
  })
})
