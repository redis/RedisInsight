import { cloneDeep } from 'lodash'
import { http, HttpResponse } from 'msw'
import reducer, {
  appInitSelector,
  FAILED_TO_FETCH_CSRF_TOKEN_ERROR,
  FAILED_TO_FETCH_FEATURE_FLAGS_ERROR,
  initializeAppAction,
  initializeAppState,
  initializeAppStateFail,
  initializeAppStateSuccess,
  initialState,
  STATUS_FAIL,
  STATUS_LOADING,
  STATUS_SUCCESS,
} from 'uiSrc/slices/app/init'
import {
  cleanup,
  getMswURL,
  initialStateDefault,
  mockedStore,
  waitFor,
} from 'uiSrc/utils/test-utils'
import {
  getFeatureFlags,
  getFeatureFlagsFailure,
  getFeatureFlagsSuccess,
} from 'uiSrc/slices/app/features'
import { getConfig } from 'uiSrc/config'
import {
  CSRFTokenResponse,
  fetchCsrfToken,
  fetchCsrfTokenFail,
} from 'uiSrc/slices/app/csrf'
import { FEATURES_DATA_MOCK } from 'uiSrc/mocks/handlers/app/featureHandlers'
import { ApiEndpoints } from 'uiSrc/constants'
import { mswServer } from 'uiSrc/mocks/server'
import {
  getUserProfile,
  getUserProfileSuccess,
} from 'uiSrc/slices/user/cloud-user-profile'
import { CLOUD_ME_DATA_MOCK } from 'uiSrc/mocks/handlers/oauth/cloud'

const riConfig = getConfig()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('init slice', () => {
  describe('initializeAppState', () => {
    it('should properly initialize app state', () => {
      const state = {
        ...initialState,
        status: STATUS_LOADING,
      }

      // Act
      const nextState = reducer(initialState, initializeAppState())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { init: nextState },
      })

      expect(appInitSelector(rootState)).toEqual(state)
    })
  })

  describe('initializeAppStateSuccess', () => {
    it('should have success state', () => {
      const state = {
        ...initialState,
        status: STATUS_SUCCESS,
      }

      // Act
      const nextState = reducer(initialState, initializeAppStateSuccess())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { init: nextState },
      })

      expect(appInitSelector(rootState)).toEqual(state)
    })
  })

  describe('initializeAppStateFail', () => {
    it('should have fail state', () => {
      const state = {
        ...initialState,
        status: STATUS_FAIL,
        error: FAILED_TO_FETCH_CSRF_TOKEN_ERROR,
      }

      // Act
      const nextState = reducer(
        initialState,
        initializeAppStateFail({
          error: FAILED_TO_FETCH_CSRF_TOKEN_ERROR,
        }),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { init: nextState },
      })

      expect(appInitSelector(rootState)).toEqual(state)
    })
  })

  describe('initApp', () => {
    it('succeed to init data', async () => {
      // Act
      await store.dispatch<any>(initializeAppAction())

      // Assert
      const expectedActions = [
        initializeAppState(),
        getFeatureFlags(),
        getFeatureFlagsSuccess(FEATURES_DATA_MOCK),
        initializeAppStateSuccess(),
      ]

      expect(store.getActions()).toEqual(expectedActions)
    })

    it('failed to init data', async () => {
      mswServer.use(
        http.get<any, (typeof FEATURES_DATA_MOCK)[]>(
          getMswURL(ApiEndpoints.FEATURES),
          async () => {
            HttpResponse.text('', { status: 500 })
          },
        ),
      )

      // Act
      await store.dispatch<any>(initializeAppAction())

      // Assert
      const expectedActions = [
        initializeAppState(),
        getFeatureFlags(),
        getFeatureFlagsFailure(),
        initializeAppStateFail({ error: FAILED_TO_FETCH_FEATURE_FLAGS_ERROR }),
      ]

      expect(store.getActions()).toEqual(expectedActions)
    })

    it('failed to init csrf', async () => {
      riConfig.api.csrfEndpoint = 'http://localhost/csrf'
      mswServer.use(
        http.get<any, CSRFTokenResponse>(
          getMswURL(riConfig.api.csrfEndpoint),
          async () => {
            HttpResponse.text('', { status: 500 })
          },
        ),
      )

      // Act
      await store.dispatch<any>(initializeAppAction())

      // Assert
      const expectedActions = [
        initializeAppState(),
        fetchCsrfToken(),
        fetchCsrfTokenFail({ error: 'Network Error' }),
        initializeAppStateFail({ error: FAILED_TO_FETCH_CSRF_TOKEN_ERROR }),
      ]

      expect(store.getActions()).toEqual(expectedActions)
    })

    it('fetches user profile if !envDependent', async () => {
      riConfig.api.csrfEndpoint = ''

      const newFeatureFlags = {
        features: {
          ...FEATURES_DATA_MOCK.features,
          envDependent: {
            name: 'envDependent',
            flag: false,
          },
        },
      }

      // Arrange
      mswServer.use(
        http.get<any, (typeof FEATURES_DATA_MOCK)[]>(
          getMswURL(ApiEndpoints.FEATURES),
          async () => {
            HttpResponse.json(newFeatureFlags, { status: 200 })
          },
        ),
      )

      // Act
      await store.dispatch<any>(initializeAppAction())

      // Assert
      const expectedActions = [
        initializeAppState(),
        getFeatureFlags(),
        getFeatureFlagsSuccess(newFeatureFlags),
        getUserProfile(),
        getUserProfileSuccess(CLOUD_ME_DATA_MOCK),
        initializeAppStateSuccess(),
      ]

      await waitFor(() => {
        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
