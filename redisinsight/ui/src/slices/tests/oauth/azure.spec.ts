import { cloneDeep } from 'lodash'
import { faker } from '@faker-js/faker'
import { AxiosError } from 'axios'

import reducer, {
  initialState,
  azureAuthLogin,
  azureAuthLoginSuccess,
  azureAuthLoginFailure,
  azureOAuthCallbackSuccess,
  azureOAuthCallbackFailure,
  azureAuthLogout,
  setAzureAuthInitialState,
  setAzureLoginSource,
  azureAuthSelector,
  azureAuthAccountSelector,
  azureAuthLoadingSelector,
  initiateAzureLoginAction,
  cancelAzureLoginAction,
  handleAzureOAuthSuccess,
} from 'uiSrc/slices/oauth/azure'
import { AzureLoginSource } from 'uiSrc/slices/interfaces'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { resetDataAzure } from 'uiSrc/slices/instances/azure'
import { apiService } from 'uiSrc/services'
import {
  cleanup,
  initialStateDefault,
  mockStore,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import { AzureAccountFactory } from 'uiSrc/mocks/factories/cloud/AzureAccount.factory'
import { TelemetryEvent } from 'uiSrc/telemetry'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const mockAccount = AzureAccountFactory.build()

describe('azure auth slice', () => {
  describe('reducer, actions and selectors', () => {
    it('should return the initial state on first run', () => {
      const nextState = initialState
      const result = reducer(undefined, { type: '' })
      expect(result).toEqual(nextState)
    })

    it('should reset to initial state with setAzureAuthInitialState', () => {
      const modifiedState = {
        ...initialState,
        loading: true,
        error: 'some error',
      }
      const result = reducer(modifiedState, setAzureAuthInitialState())
      expect(result).toEqual(initialState)
    })
  })

  describe('setAzureLoginSource', () => {
    it('should set source to autodiscovery', () => {
      const nextState = reducer(
        initialState,
        setAzureLoginSource(AzureLoginSource.Autodiscovery),
      )
      expect(nextState.source).toEqual(AzureLoginSource.Autodiscovery)
    })

    it('should set source to token-refresh', () => {
      const nextState = reducer(
        initialState,
        setAzureLoginSource(AzureLoginSource.TokenRefresh),
      )
      expect(nextState.source).toEqual(AzureLoginSource.TokenRefresh)
    })

    it('should reset source to null', () => {
      const prevState = {
        ...initialState,
        source: AzureLoginSource.Autodiscovery,
      }
      const nextState = reducer(prevState, setAzureLoginSource(null))
      expect(nextState.source).toBeNull()
    })
  })

  describe('azureAuthLogin', () => {
    it('should set loading = true and clear error', () => {
      const state = {
        ...initialState,
        loading: true,
        error: '',
      }

      const nextState = reducer(initialState, azureAuthLogin())

      const rootState = Object.assign(initialStateDefault, {
        oauth: { azure: nextState },
      })
      expect(azureAuthSelector(rootState)).toEqual(state)
    })
  })

  describe('azureAuthLoginSuccess', () => {
    it('should keep loading true and clear error', () => {
      const prevState = { ...initialState, loading: true }
      const state = {
        ...initialState,
        loading: true,
        error: '',
      }

      const nextState = reducer(prevState, azureAuthLoginSuccess())

      const rootState = Object.assign(initialStateDefault, {
        oauth: { azure: nextState },
      })
      expect(azureAuthSelector(rootState)).toEqual(state)
    })
  })

  describe('azureAuthLoginFailure', () => {
    it('should set loading = false and set error', () => {
      const errorMessage = faker.lorem.sentence()
      const prevState = { ...initialState, loading: true }
      const state = {
        ...initialState,
        loading: false,
        error: errorMessage,
      }

      const nextState = reducer(prevState, azureAuthLoginFailure(errorMessage))

      const rootState = Object.assign(initialStateDefault, {
        oauth: { azure: nextState },
      })
      expect(azureAuthSelector(rootState)).toEqual(state)
    })
  })

  describe('azureOAuthCallbackSuccess', () => {
    it('should set loading = false, set account, and clear error', () => {
      const prevState = { ...initialState, loading: true }
      const state = {
        ...initialState,
        loading: false,
        account: mockAccount,
        tenant: mockAccount.tenantId,
        error: '',
      }

      const nextState = reducer(
        prevState,
        azureOAuthCallbackSuccess(mockAccount),
      )

      const rootState = Object.assign(initialStateDefault, {
        oauth: { azure: nextState },
      })
      expect(azureAuthSelector(rootState)).toEqual(state)
    })

    it('should set the tenant to the signed-in account realm', () => {
      const account = AzureAccountFactory.build({ tenantId: 'realm-guid' })

      const nextState = reducer(
        initialState,
        azureOAuthCallbackSuccess(account),
      )

      expect(nextState.tenant).toEqual('realm-guid')
    })

    it('should null the tenant when the account has no realm', () => {
      const account = AzureAccountFactory.build({ tenantId: undefined })

      const nextState = reducer(
        { ...initialState, tenant: 'stale-realm' },
        azureOAuthCallbackSuccess(account),
      )

      expect(nextState.tenant).toBeNull()
    })

    it('should not reset source (ConfigAzureAuth needs it for redirect decision)', () => {
      const prevState = {
        ...initialState,
        loading: true,
        source: AzureLoginSource.Autodiscovery,
      }

      const nextState = reducer(
        prevState,
        azureOAuthCallbackSuccess(mockAccount),
      )

      expect(nextState.source).toEqual(AzureLoginSource.Autodiscovery)
    })
  })

  describe('azureOAuthCallbackFailure', () => {
    it('should set loading = false and set error', () => {
      const errorMessage = faker.lorem.sentence()
      const prevState = { ...initialState, loading: true }
      const state = {
        ...initialState,
        loading: false,
        error: errorMessage,
      }

      const nextState = reducer(
        prevState,
        azureOAuthCallbackFailure(errorMessage),
      )

      const rootState = Object.assign(initialStateDefault, {
        oauth: { azure: nextState },
      })
      expect(azureAuthSelector(rootState)).toEqual(state)
    })

    it('should keep the current tenant so a failed sign-in cannot change it', () => {
      const nextState = reducer(
        { ...initialState, loading: true, tenant: 'active-realm' },
        azureOAuthCallbackFailure(faker.lorem.sentence()),
      )

      expect(nextState.tenant).toEqual('active-realm')
    })
  })

  describe('azureAuthLogout', () => {
    it('should clear account, error and tenant', () => {
      const prevState = {
        ...initialState,
        account: mockAccount,
        error: 'error',
        tenant: 'active-realm',
      }
      const state = {
        ...initialState,
        account: null,
        error: '',
        tenant: null,
      }

      const nextState = reducer(prevState, azureAuthLogout())

      const rootState = Object.assign(initialStateDefault, {
        oauth: { azure: nextState },
      })
      expect(azureAuthSelector(rootState)).toEqual(state)
    })
  })

  describe('selectors', () => {
    it('azureAuthAccountSelector should return account', () => {
      const rootState = {
        ...initialStateDefault,
        oauth: {
          ...initialStateDefault.oauth,
          azure: { ...initialState, account: mockAccount },
        },
      }
      expect(azureAuthAccountSelector(rootState)).toEqual(mockAccount)
    })

    it('azureAuthLoadingSelector should return loading', () => {
      const rootState = {
        ...initialStateDefault,
        oauth: {
          ...initialStateDefault.oauth,
          azure: { ...initialState, loading: true },
        },
      }
      expect(azureAuthLoadingSelector(rootState)).toEqual(true)
    })
  })

  describe('thunks', () => {
    describe('initiateAzureLoginAction', () => {
      it('should dispatch login actions and call onSuccess on success', async () => {
        const authUrl = faker.internet.url()
        const responsePayload = { data: { url: authUrl }, status: 200 }
        const onSuccess = jest.fn()

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        await store.dispatch<any>(
          initiateAzureLoginAction({
            source: AzureLoginSource.Autodiscovery,
            onSuccess,
          }),
        )

        const expectedActions = [
          setAzureLoginSource(AzureLoginSource.Autodiscovery),
          azureAuthLogin(),
          azureAuthLoginSuccess(),
        ]
        expect(store.getActions()).toEqual(expectedActions)
        expect(onSuccess).toHaveBeenCalledWith(authUrl)
      })

      it('should dispatch failure and error notification on API error', async () => {
        const errorMessage = 'Failed to get auth URL'
        const error = {
          response: { data: { message: errorMessage } },
        } as AxiosError

        apiService.get = jest.fn().mockRejectedValue(error)

        await store.dispatch<any>(
          initiateAzureLoginAction({
            source: AzureLoginSource.Autodiscovery,
            onSuccess: jest.fn(),
          }),
        )

        const actions = store.getActions()
        expect(actions[0]).toEqual(
          setAzureLoginSource(AzureLoginSource.Autodiscovery),
        )
        expect(actions[1]).toEqual(azureAuthLogin())
        expect(actions[2]).toEqual(azureAuthLoginFailure(errorMessage))
        expect(actions[3].type).toEqual(addErrorNotification({} as any).type)
      })

      it('should set source to token-refresh when initiated from error notification', async () => {
        const authUrl = faker.internet.url()
        const responsePayload = { data: { url: authUrl }, status: 200 }
        const onSuccess = jest.fn()

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        await store.dispatch<any>(
          initiateAzureLoginAction({
            source: AzureLoginSource.TokenRefresh,
            onSuccess,
          }),
        )

        const expectedActions = [
          setAzureLoginSource(AzureLoginSource.TokenRefresh),
          azureAuthLogin(),
          azureAuthLoginSuccess(),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('should pass prompt parameter as query param to API', async () => {
        const authUrl = faker.internet.url()
        const responsePayload = { data: { url: authUrl }, status: 200 }
        const onSuccess = jest.fn()

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        await store.dispatch<any>(
          initiateAzureLoginAction({
            source: AzureLoginSource.Autodiscovery,
            onSuccess,
            prompt: 'select_account',
          }),
        )

        expect(apiService.get).toHaveBeenCalledWith(expect.any(String), {
          params: { prompt: 'select_account' },
        })
      })

      it('should not pass params when prompt is not provided', async () => {
        const authUrl = faker.internet.url()
        const responsePayload = { data: { url: authUrl }, status: 200 }
        const onSuccess = jest.fn()

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        await store.dispatch<any>(
          initiateAzureLoginAction({
            source: AzureLoginSource.Autodiscovery,
            onSuccess,
          }),
        )

        expect(apiService.get).toHaveBeenCalledWith(expect.any(String), {
          params: undefined,
        })
      })

      it('should pass tenantId parameter as query param to API', async () => {
        const authUrl = faker.internet.url()
        const responsePayload = { data: { url: authUrl }, status: 200 }
        const tenantId = 'your-tenant.onmicrosoft.com'

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        await store.dispatch<any>(
          initiateAzureLoginAction({
            source: AzureLoginSource.Autodiscovery,
            onSuccess: jest.fn(),
            tenantId,
          }),
        )

        expect(apiService.get).toHaveBeenCalledWith(expect.any(String), {
          params: { tenantId },
        })
      })
    })

    // The slice binds to the real sendEventTelemetry at load time, so a
    // module-level jest.mock can't intercept its thunks' calls. Reload the
    // slice against the mock and read the spy from the same fresh module graph.
    describe('sign-in telemetry', () => {
      let telemetrySlice: typeof import('uiSrc/slices/oauth/azure')
      let telemetryApi: typeof apiService
      let sendEventTelemetryMock: jest.Mock

      beforeEach(async () => {
        jest.resetModules()
        jest.unmock('uiSrc/services')
        telemetrySlice = await import('uiSrc/slices/oauth/azure')
        telemetryApi = (await import('uiSrc/services')).apiService
        sendEventTelemetryMock = jest.mocked(
          (await import('uiSrc/telemetry')).sendEventTelemetry,
        )
      })

      it('should send customTenant=false when no tenant is provided', async () => {
        telemetryApi.get = jest.fn().mockResolvedValue({
          data: { url: faker.internet.url() },
          status: 200,
        })
        const local = mockStore(initialStateDefault)

        await local.dispatch<any>(
          telemetrySlice.initiateAzureLoginAction({
            source: AzureLoginSource.Autodiscovery,
            onSuccess: jest.fn(),
          }),
        )

        expect(sendEventTelemetryMock).toHaveBeenCalledWith({
          event: TelemetryEvent.AZURE_SIGN_IN_CLICKED,
          eventData: { customTenant: false },
        })
      })

      it('should send customTenant=true when a tenant is provided', async () => {
        telemetryApi.get = jest.fn().mockResolvedValue({
          data: { url: faker.internet.url() },
          status: 200,
        })
        const local = mockStore(initialStateDefault)

        await local.dispatch<any>(
          telemetrySlice.initiateAzureLoginAction({
            source: AzureLoginSource.Autodiscovery,
            onSuccess: jest.fn(),
            tenantId: 'your-tenant.onmicrosoft.com',
          }),
        )

        expect(sendEventTelemetryMock).toHaveBeenCalledWith({
          event: TelemetryEvent.AZURE_SIGN_IN_CLICKED,
          eventData: { customTenant: true },
        })
      })
    })

    describe('handleAzureOAuthSuccess', () => {
      it('should dispatch resetDataAzure to clear stale data when switching accounts', () => {
        store.dispatch<any>(handleAzureOAuthSuccess(mockAccount))

        const actions = store.getActions()
        expect(actions).toContainEqual(resetDataAzure())
        expect(actions).toContainEqual(azureOAuthCallbackSuccess(mockAccount))
      })
    })

    describe('cancelAzureLoginAction', () => {
      it('should dispatch setAzureAuthInitialState to reset loading state', () => {
        store.dispatch<any>(cancelAzureLoginAction())

        const actions = store.getActions()
        expect(actions).toContainEqual(setAzureAuthInitialState())
      })

      it('should reset loading to false in the reducer when cancelled', () => {
        const loadingState = { ...initialState, loading: true }
        const result = reducer(loadingState, setAzureAuthInitialState())
        expect(result.loading).toBe(false)
      })
    })
  })
})
