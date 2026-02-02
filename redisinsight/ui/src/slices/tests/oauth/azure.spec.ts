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
  azureAuthSelector,
  azureAuthAccountSelector,
  azureAuthLoadingSelector,
  initiateAzureLoginAction,
  AzureAccount,
} from 'uiSrc/slices/oauth/azure'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { apiService } from 'uiSrc/services'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const mockAccount: AzureAccount = {
  id: faker.string.uuid(),
  username: faker.internet.email(),
  name: faker.person.fullName(),
}

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
  })

  describe('azureAuthLogout', () => {
    it('should clear account and error', () => {
      const prevState = {
        ...initialState,
        account: mockAccount,
        error: 'error',
      }
      const state = {
        ...initialState,
        account: null,
        error: '',
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

        await store.dispatch<any>(initiateAzureLoginAction(onSuccess))

        const expectedActions = [azureAuthLogin(), azureAuthLoginSuccess()]
        expect(store.getActions()).toEqual(expectedActions)
        expect(onSuccess).toHaveBeenCalledWith(authUrl)
      })

      it('should dispatch failure and error notification on API error', async () => {
        const errorMessage = 'Failed to get auth URL'
        const error = {
          response: { data: { message: errorMessage } },
        } as AxiosError

        apiService.get = jest.fn().mockRejectedValue(error)

        await store.dispatch<any>(initiateAzureLoginAction(jest.fn()))

        const actions = store.getActions()
        expect(actions[0]).toEqual(azureAuthLogin())
        expect(actions[1]).toEqual(azureAuthLoginFailure(errorMessage))
        expect(actions[2].type).toEqual(addErrorNotification({} as any).type)
      })
    })
  })
})
