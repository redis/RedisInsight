import { cloneDeep } from 'lodash'
import { AxiosError } from 'axios'

import {
  cleanup,
  clearStoreActions,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { apiService } from 'uiSrc/services'
import {
  addErrorNotification,
  addInfiniteNotification,
  addMessageNotification,
  removeInfiniteNotification,
} from 'uiSrc/slices/app/notifications'
import {
  INFINITE_MESSAGES,
  InfiniteMessagesIds,
} from 'uiSrc/components/notifications/components'
import { CloudJobStatus, CloudJobName } from 'uiSrc/electron/constants'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { setSSOFlow } from 'uiSrc/slices/instances/cloud'
import reducer, {
  initialState,
  oauthCloudSelector,
  signIn,
  signInSuccess,
  signInFailure,
  getUserInfo,
  getUserInfoSuccess,
  getUserInfoFailure,
  fetchUserInfo,
  addFreeDbFailure,
  addFreeDbSuccess,
  addFreeDb,
  createFreeDbJob,
  setSelectAccountDialogState,
  createFreeDbSuccess,
  activateAccount,
  setJob,
  fetchPlans,
  getPlans,
  getPlansSuccess,
  getPlansFailure,
  setIsOpenSelectPlanDialog,
  showOAuthProgress,
  setAgreement,
  getCapiKeys,
  getCapiKeysSuccess,
  getCapiKeysFailure,
  removeCapiKey,
  removeCapiKeySuccess,
  removeCapiKeyFailure,
  removeAllCapiKeysSuccess,
  removeAllCapiKeysFailure,
  removeAllCapiKeys,
  getCapiKeysAction,
  removeAllCapiKeysAction,
  removeCapiKeyAction,
  setOAuthCloudSource,
  setSocialDialogState,
  logoutUser,
  logoutUserSuccess,
  logoutUserFailure,
  logoutUserAction,
  oauthCloudUserSelector,
  setInitialLoadingState,
} from '../../oauth/cloud'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('oauth cloud slice', () => {
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

  describe('signIn', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, signIn())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState,
        },
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('signInSuccess', () => {
    it('should properly set the state', () => {
      // Arrange
      const data = 'message'
      const state = {
        ...initialState,
        message: data,
        loading: false,
      }

      // Act
      const nextState = reducer(initialState, signInSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState,
        },
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('signInFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
      }

      // Act
      const nextState = reducer(initialState, signInFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState,
        },
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('getUserInfo', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        user: {
          ...initialState.user,
          loading: true,
        },
      }

      // Act
      const nextState = reducer(initialState, getUserInfo())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState,
        },
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('getUserInfoSuccess', () => {
    it('should properly set the state with fetched data', () => {
      const data = { id: 12 }
      // Arrange
      const state = {
        ...initialState,
        user: {
          ...initialState.user,
          loading: false,
          data,
        },
      }

      // Act
      const nextState = reducer(initialState, getUserInfoSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState,
        },
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('getUserInfoFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        user: {
          ...initialState.user,
          loading: false,
          error: data,
        },
      }

      // Act
      const nextState = reducer(initialState, getUserInfoFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState,
        },
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('addFreeDb', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        user: {
          ...initialState.user,
          freeDb: {
            ...initialState.user.freeDb,
            loading: true,
          },
        },
      }

      // Act
      const nextState = reducer(initialState, addFreeDb())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState,
        },
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('addFreeDbSuccess', () => {
    it('should properly set the state with fetched data', () => {
      const data = {
        host: 'localhost',
        port: 6379,
        id: 'id',
        modules: [],
        version: '1',
      }
      // Arrange
      const state = {
        ...initialState,
        user: {
          ...initialState.user,
          freeDb: {
            ...initialState.user.freeDb,
            data,
            loading: false,
          },
        },
      }

      // Act
      const nextState = reducer(initialState, addFreeDbSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState,
        },
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('addFreeDbFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        user: {
          ...initialState.user,
          freeDb: {
            ...initialState.user.freeDb,
            loading: false,
            error: data,
          },
        },
      }

      // Act
      const nextState = reducer(initialState, addFreeDbFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState,
        },
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('setSelectAccountDialogState', () => {
    it('should properly set the state', () => {
      // Arrange
      const data = true
      const state = {
        ...initialState,
        isOpenSelectAccountDialog: true,
      }

      // Act
      const nextState = reducer(initialState, setSelectAccountDialogState(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState,
        },
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('setIsOpenSelectPlanDialog', () => {
    it('should properly set the state', () => {
      // Arrange
      const data = true
      const state = {
        ...initialState,
        plan: {
          ...initialState.plan,
          isOpenDialog: true,
        },
      }

      // Act
      const nextState = reducer(initialState, setIsOpenSelectPlanDialog(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState,
        },
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('getPlans', () => {
    it('should properly set the state', () => {
      // Arrange
      const state = {
        ...initialState,
        plan: {
          ...initialState.plan,
          loading: true,
        },
      }

      // Act
      const nextState = reducer(initialState, getPlans())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState,
        },
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('getPlansSuccess', () => {
    it('should properly set the state', () => {
      // Arrange
      const data = [
        {
          id: 12148,
          type: 'fixed',
          name: 'Cache 30MB',
          provider: 'AWS',
          region: 'eu-west-1',
          price: 0,
          details: {
            countryName: 'Poland',
            cityName: 'Warsaw',
            id: 12148,
            region: 'eu-west-1',
          },
        },
      ]
      const state = {
        ...initialState,
        plan: {
          ...initialState.plan,
          loading: false,
          data,
        },
      }

      // Act
      const nextState = reducer(initialState, getPlansSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState,
        },
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('getPlansFailure', () => {
    it('should properly set the state', () => {
      // Arrange
      const state = {
        ...initialState,
        plan: {
          ...initialState.plan,
          loading: false,
        },
      }

      // Act
      const nextState = reducer(initialState, getPlansFailure())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState,
        },
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('setSocialDialogState', () => {
    it('should properly set the source=SignInDialogSource.BrowserSearch and isOpenSocialDialog=true', () => {
      // Arrange
      const state = {
        ...initialState,
        isOpenSocialDialog: true,
        source: OAuthSocialSource.BrowserSearch,
      }

      // Act
      const nextState = reducer(
        initialState,
        setSocialDialogState(OAuthSocialSource.BrowserSearch),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: { cloud: nextState },
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })

    it('should not set source=null and set and isOpenSocialDialog=false', () => {
      // Arrange
      const prevState = {
        ...initialState,
        isOpenSocialDialog: true,
        source: OAuthSocialSource.BrowserSearch,
      }
      const state = {
        ...initialState,
        isOpenSocialDialog: false,
        source: OAuthSocialSource.BrowserSearch,
      }

      // Act
      const nextState = reducer(prevState, setSocialDialogState(null))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: { cloud: nextState },
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('setAgreement', () => {
    it('should properly set the state', () => {
      // Arrange
      const prevInitialState = {
        ...initialState,
        agreement: false,
      }
      const state = {
        ...initialState,
        agreement: true,
      }

      // Act
      const nextState = reducer(prevInitialState, setAgreement(true))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: { cloud: nextState },
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('getCapiKeys', () => {
    it('should properly set the state', () => {
      // Arrange
      const state = {
        ...initialState,
        capiKeys: {
          ...initialState.capiKeys,
          loading: true,
        },
      }

      // Act
      const nextState = reducer(initialState, getCapiKeys())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState,
        },
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('getCapiKeysSuccess', () => {
    it('should properly set the state', () => {
      // Arrange
      const data = [
        {
          id: '1',
        },
      ]
      const state = {
        ...initialState,
        capiKeys: {
          ...initialState.capiKeys,
          data,
          loading: false,
        },
      }

      // Act
      const nextState = reducer(initialState, getCapiKeysSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState,
        },
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('getCapiKeysFailure', () => {
    it('should properly set the state', () => {
      // Arrange
      const state = {
        ...initialState,
        capiKeys: {
          ...initialState.capiKeys,
          loading: false,
        },
      }

      // Act
      const nextState = reducer(initialState, getCapiKeysFailure())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState,
        },
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('removeCapiKey', () => {
    it('should properly set the state', () => {
      // Arrange
      const state = {
        ...initialState,
        capiKeys: {
          ...initialState.capiKeys,
          loading: true,
        },
      }

      // Act
      const nextState = reducer(initialState, removeCapiKey())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState,
        },
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('removeCapiKeySuccess', () => {
    it('should properly set the state', () => {
      // Arrange
      const currentState = {
        ...initialState,
        capiKeys: {
          data: [{ id: '1' }, { id: '2' }, { id: '3' }],
        },
      }
      const state = {
        ...initialState,
        capiKeys: {
          ...initialState.capiKeys,
          loading: false,
          data: [{ id: '1' }, { id: '3' }],
        },
      }

      // Act
      const nextState = reducer(currentState, removeCapiKeySuccess('2'))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState,
        },
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('removeCapiKeyFailure', () => {
    it('should properly set the state', () => {
      // Arrange
      const state = {
        ...initialState,
        capiKeys: {
          ...initialState.capiKeys,
          loading: false,
        },
      }

      // Act
      const nextState = reducer(initialState, removeCapiKeyFailure())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState,
        },
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('removeAllCapiKeys', () => {
    it('should properly set the state', () => {
      // Arrange
      const state = {
        ...initialState,
        capiKeys: {
          ...initialState.capiKeys,
          loading: true,
        },
      }

      // Act
      const nextState = reducer(initialState, removeAllCapiKeys())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState,
        },
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('removeAllCapiKeysSuccess', () => {
    it('should properly set the state', () => {
      // Arrange
      const currentState = {
        ...initialState,
        capiKeys: {
          data: [{ id: '1' }, { id: '2' }, { id: '3' }],
        },
      }
      const state = {
        ...initialState,
        capiKeys: {
          ...initialState.capiKeys,
          loading: false,
          data: [],
        },
      }

      // Act
      const nextState = reducer(currentState, removeAllCapiKeysSuccess())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState,
        },
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('removeAllCapiKeysFailure', () => {
    it('should properly set the state', () => {
      // Arrange
      const state = {
        ...initialState,
        capiKeys: {
          ...initialState.capiKeys,
          loading: false,
        },
      }

      // Act
      const nextState = reducer(initialState, removeAllCapiKeysFailure())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState,
        },
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('setOAuthCloudSource', () => {
    it('should properly set the state', () => {
      // Arrange
      const data = OAuthSocialSource.Autodiscovery
      const state = {
        ...initialState,
        source: data,
      }

      // Act
      const nextState = reducer(initialState, setOAuthCloudSource(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState,
        },
      })
      expect(oauthCloudSelector(rootState)).toEqual(state)
    })
  })

  describe('logoutUser', () => {
    it('should properly set the state', () => {
      // Arrange
      const state = {
        ...initialState.user,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, logoutUser())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState,
        },
      })
      expect(oauthCloudUserSelector(rootState)).toEqual(state)
    })
  })

  describe('logoutUserSuccess', () => {
    it('should properly set the state', () => {
      // Arrange
      const currentState = {
        ...initialState,
        user: {
          ...initialState.user,
          loading: true,
          data: {},
        },
      }

      // Act
      const nextState = reducer(currentState as any, logoutUserSuccess())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState,
        },
      })
      expect(oauthCloudUserSelector(rootState)).toEqual(initialState.user)
    })
  })

  describe('logoutUserFailure', () => {
    it('should properly set the state', () => {
      // Arrange
      const currentState = {
        ...initialState,
        user: {
          ...initialState.user,
          loading: true,
          data: {},
        },
      }

      // Act
      const nextState = reducer(currentState as any, logoutUserFailure())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState,
        },
      })
      expect(oauthCloudUserSelector(rootState)).toEqual(initialState.user)
    })
  })

  describe('setInitialLoadingState', () => {
    it('should properly set the state', () => {
      // Arrange
      const userState = {
        ...initialState.user,
        initialLoading: false,
      }

      // Act
      const nextState = reducer(
        initialState as any,
        setInitialLoadingState(false),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        oauth: {
          cloud: nextState,
        },
      })
      expect(oauthCloudUserSelector(rootState)).toEqual(userState)
    })
  })

  describe('thunks', () => {
    describe('fetchUserInfo', () => {
      it('call both fetchUserInfo and getUserInfoSuccess when fetch is successed', async () => {
        // Arrange
        const data = { id: 123123 }
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchUserInfo())

        // Assert
        const expectedActions = [
          getUserInfo(),
          getUserInfoSuccess(responsePayload.data),
          setSocialDialogState(null),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
      it('call setSelectAccountDialogState and setSocialDialogState when fetch is successed and accounts > 1', async () => {
        // Arrange
        const data = { id: 123123, accounts: [{}, {}] }
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchUserInfo())

        // Assert
        const expectedActions = [
          getUserInfo(),
          setSelectAccountDialogState(true),
          removeInfiniteNotification(InfiniteMessagesIds.oAuthProgress),
          getUserInfoSuccess(responsePayload.data),
          setSocialDialogState(null),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('call both fetchAccountInfo and getUserInfoFailure when fetch is fail', async () => {
        // Arrange
        const errorMessage =
          'Could not connect to aoeu:123, please check the connection details.'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(fetchUserInfo())

        // Assert
        const expectedActions = [
          getUserInfo(),
          addErrorNotification(responsePayload as AxiosError),
          getUserInfoFailure(responsePayload.response.data.message),
          setOAuthCloudSource(null),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('createFreeDb', () => {
      it('call both addFreeDb and setJob when post is successed', async () => {
        // Arrange
        const data = {
          id: '123123',
          name: CloudJobName.CreateFreeSubscriptionAndDatabase,
          status: CloudJobStatus.Running,
        }
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)
        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          createFreeDbJob({
            name: CloudJobName.CreateFreeSubscriptionAndDatabase,
          }),
        )

        // Assert
        const expectedActions = [addFreeDb(), setJob(data)]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('call both fetchAccountInfo and addFreeDbFailure when post is fail', async () => {
        // Arrange
        const errorMessage =
          'Could not connect to aoeu:123, please check the connection details.'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(
          createFreeDbJob({
            name: CloudJobName.CreateFreeSubscriptionAndDatabase,
          }),
        )

        // Assert
        const expectedActions = [
          addFreeDb(),
          addErrorNotification(responsePayload as AxiosError),
          addFreeDbFailure(responsePayload.response.data.message),
          setOAuthCloudSource(null),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('activateAccount', () => {
      it('call both getUserInfo and getUserInfoSuccess when put is successed', async () => {
        // Arrange
        const data = {
          id: 3,
          accounts: [
            { id: 3, name: 'name' },
            { id: 4, name: 'name' },
          ],
        }
        const responseAccountPayload = { data, status: 200 }

        apiService.put = jest.fn().mockResolvedValue(responseAccountPayload)

        // Act
        await store.dispatch<any>(activateAccount('123'))

        // Assert
        const expectedActions = [getUserInfo(), getUserInfoSuccess(data)]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('call both getUserInfo and getUserInfoFailure when put is fail', async () => {
        // Arrange
        const errorMessage =
          'Could not connect to aoeu:123, please check the connection details.'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.put = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(activateAccount('3'))

        // Assert
        const expectedActions = [
          getUserInfo(),
          addErrorNotification(responsePayload as AxiosError),
          getUserInfoFailure(responsePayload.response.data.message),
          setOAuthCloudSource(null),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('createFreeDbSuccess', () => {
      it('should call proper actions without error', async () => {
        // Arrange
        const result = {
          resourceId: '123',
        }
        const onConnect = () => {}

        // Act
        await store.dispatch<any>(
          createFreeDbSuccess(result, {}, CloudJobName.CreateFreeDatabase),
        )

        // Assert
        const expectedActions = [
          showOAuthProgress(true),
          removeInfiniteNotification(InfiniteMessagesIds.oAuthProgress),
          addInfiniteNotification(
            INFINITE_MESSAGES.SUCCESS_CREATE_DB(
              {},
              onConnect,
              CloudJobName.CreateFreeDatabase,
            ),
          ),
          setSelectAccountDialogState(false),
        ]
        expect(clearStoreActions(store.getActions())).toEqual(
          clearStoreActions(expectedActions),
        )
      })
    })

    describe('fetchPlans', () => {
      it('call both fetchPlans and getPlansSuccess when fetch is successed', async () => {
        // Arrange
        const data = [
          {
            id: 12148,
            type: 'fixed',
            name: 'Cache 30MB',
            provider: 'AWS',
            region: 'eu-west-1',
            price: 0,
            details: {
              countryName: 'Poland',
              cityName: 'Warsaw',
              id: 12148,
              region: 'eu-west-1',
            },
          },
        ]
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchPlans())

        // Assert
        const expectedActions = [
          getPlans(),
          getPlansSuccess(responsePayload.data),
          setIsOpenSelectPlanDialog(true),
          setSocialDialogState(null),
          setSelectAccountDialogState(false),
          removeInfiniteNotification(InfiniteMessagesIds.oAuthProgress),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
      it('call setIsOpenSelectPlanDialog and setSocialDialogState when fetch is successed and accounts > 1', async () => {
        // Arrange
        const data = [
          {
            id: 12148,
            type: 'fixed',
            name: 'Cache 30MB',
            provider: 'AWS',
            region: 'eu-west-1',
            price: 0,
            details: {
              countryName: 'Poland',
              cityName: 'Warsaw',
              id: 12148,
              region: 'eu-west-1',
            },
          },
        ]
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchPlans())

        // Assert
        const expectedActions = [
          getPlans(),
          getPlansSuccess(responsePayload.data),
          setIsOpenSelectPlanDialog(true),
          setSocialDialogState(null),
          setSelectAccountDialogState(false),
          removeInfiniteNotification(InfiniteMessagesIds.oAuthProgress),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('call both getPlans and getPlansFailure when fetch is fail', async () => {
        // Arrange
        const errorMessage =
          'Could not connect to aoeu:123, please check the connection details.'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(fetchPlans())

        // Assert
        const expectedActions = [
          getPlans(),
          addErrorNotification(responsePayload as AxiosError),
          getPlansFailure(),
          removeInfiniteNotification(InfiniteMessagesIds.oAuthProgress),
          setOAuthCloudSource(null),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('getCapiKeysAction', () => {
      it('should call proper actions on succeed', async () => {
        const data = [{ id: '1' }, { id: '2' }]

        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(getCapiKeysAction())

        // Assert
        const expectedActions = [getCapiKeys(), getCapiKeysSuccess(data)]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('should call proper actions on failed', async () => {
        const errorMessage = 'Error'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(getCapiKeysAction())

        // Assert
        const expectedActions = [
          getCapiKeys(),
          addErrorNotification(responsePayload as AxiosError),
          getCapiKeysFailure(),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('removeAllCapiKeysAction', () => {
      it('should call proper actions on succeed', async () => {
        const responsePayload = { status: 200 }

        apiService.delete = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(removeAllCapiKeysAction())

        // Assert
        const expectedActions = [
          removeAllCapiKeys(),
          removeAllCapiKeysSuccess(),
          addMessageNotification(successMessages.REMOVED_ALL_CAPI_KEYS()),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('should call proper actions on failed', async () => {
        const errorMessage = 'Error'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.delete = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(removeAllCapiKeysAction())

        // Assert
        const expectedActions = [
          removeAllCapiKeys(),
          addErrorNotification(responsePayload as AxiosError),
          removeAllCapiKeysFailure(),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('removeCapiKeyAction', () => {
      it('should call proper actions on succeed', async () => {
        const responsePayload = { status: 200 }

        apiService.delete = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(removeCapiKeyAction({ id: '1', name: 'Key' }))

        // Assert
        const expectedActions = [
          removeCapiKey(),
          removeCapiKeySuccess('1'),
          addMessageNotification(successMessages.REMOVED_CAPI_KEY('Key')),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('should call proper actions on failed', async () => {
        const errorMessage = 'Error'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.delete = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(removeCapiKeyAction({ id: '1', name: 'Key' }))

        // Assert
        const expectedActions = [
          removeCapiKey(),
          addErrorNotification(responsePayload as AxiosError),
          removeCapiKeyFailure(),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('logoutUserAction', () => {
      it('should call proper actions on succeed', async () => {
        const responsePayload = { status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(logoutUserAction())

        // Assert
        const expectedActions = [
          logoutUser(),
          setSSOFlow(),
          logoutUserSuccess(),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('should call proper actions on failed', async () => {
        const errorMessage = 'Error'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(logoutUserAction())

        // Assert
        const expectedActions = [
          logoutUser(),
          setSSOFlow(),
          addErrorNotification(responsePayload as AxiosError),
          logoutUserFailure(),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
