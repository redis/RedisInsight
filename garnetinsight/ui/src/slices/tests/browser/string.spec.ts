import { AxiosError } from 'axios'
import { cloneDeep } from 'lodash'
import { apiService } from 'uiSrc/services'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { MOCK_TIMESTAMP } from 'uiSrc/mocks/data/dateNow'
import {
  refreshKeyInfo,
  refreshKeyInfoSuccess,
  updateSelectedKeyRefreshTime,
} from '../../browser/keys'
import reducer, {
  initialState,
  getString,
  getStringSuccess,
  getStringFailure,
  stringSelector,
  stringDataSelector,
  fetchString,
  updateValue,
  updateValueSuccess,
  updateValueFailure,
  resetStringValue,
  updateStringValueAction,
  setIsStringCompressed,
  fetchDownloadStringValue,
  downloadString,
  downloadStringSuccess,
  downloadStringFailure,
} from '../../browser/string'

let store: typeof mockedStore
let dateNow: jest.SpyInstance<number>

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
}))

describe('string slice', () => {
  beforeAll(() => {
    dateNow = jest.spyOn(Date, 'now').mockImplementation(() => MOCK_TIMESTAMP)
  })

  afterAll(() => {
    dateNow.mockRestore()
  })

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

  describe('getString', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, getString())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: {
          string: nextState,
        },
      }
      expect(stringSelector(rootState)).toEqual(state)
      expect(stringDataSelector(rootState)).toEqual(state.data)
    })
  })

  describe('getStringSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange
      const data = {
        keyName: 'zxc',
        value: 'val',
      }
      const state = {
        ...initialState,
        loading: false,
        data: {
          key: data.keyName,
          value: data.value,
        },
      }

      // Act
      const nextState = reducer(initialState, getStringSuccess(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: {
          string: nextState,
        },
      }
      expect(stringSelector(rootState)).toEqual(state)
      expect(stringDataSelector(rootState)).toEqual(state.data)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data = {
        keyName: '',
        value: '',
      }

      const state = {
        ...initialState,
        loading: false,
        data: {
          key: data.keyName,
          value: data.value,
        },
      }

      // Act
      const nextState = reducer(initialState, getStringSuccess(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: {
          string: nextState,
        },
      }
      expect(stringSelector(rootState)).toEqual(state)
      expect(stringDataSelector(rootState)).toEqual(state.data)
    })
  })

  describe('getStringFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
      }

      // Act
      const nextState = reducer(initialState, getStringFailure(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: {
          string: nextState,
        },
      }
      expect(stringSelector(rootState)).toEqual(state)
      expect(stringDataSelector(rootState)).toEqual(state.data)
    })
  })

  describe('downloadString', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, downloadString())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: {
          string: nextState,
        },
      }
      expect(stringSelector(rootState)).toEqual(state)
      expect(stringDataSelector(rootState)).toEqual(state.data)
    })
  })

  describe('downloadStringSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: false,
        error: '',
      }

      // Act
      const nextState = reducer(initialState, downloadStringSuccess())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: {
          string: nextState,
        },
      }
      expect(stringSelector(rootState)).toEqual(state)
      expect(stringDataSelector(rootState)).toEqual(state.data)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: false,
      }

      // Act
      const nextState = reducer(initialState, downloadStringSuccess())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: {
          string: nextState,
        },
      }
      expect(stringSelector(rootState)).toEqual(state)
      expect(stringDataSelector(rootState)).toEqual(state.data)
    })
  })

  describe('downloadStringFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
      }

      // Act
      const nextState = reducer(initialState, downloadStringFailure(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: {
          string: nextState,
        },
      }
      expect(stringSelector(rootState)).toEqual(state)
      expect(stringDataSelector(rootState)).toEqual(state.data)
    })
  })

  describe('updateValue', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, updateValue())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: {
          string: nextState,
        },
      }
      expect(stringSelector(rootState)).toEqual(state)
      expect(stringDataSelector(rootState)).toEqual(state.data)
    })
  })

  describe('updateValueSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const data = 'test test'
      const state = {
        ...initialState,
        loading: false,
        data: {
          ...initialState.data,
          value: data,
        },
      }

      // Act
      const nextState = reducer(initialState, updateValueSuccess(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: {
          string: nextState,
        },
      }
      expect(stringSelector(rootState)).toEqual(state)
      expect(stringDataSelector(rootState)).toEqual(state.data)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data = ''

      const state = {
        ...initialState,
        loading: false,
        data: {
          ...initialState.data,
          value: data,
        },
      }

      // Act
      const nextState = reducer(initialState, updateValueSuccess(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: {
          string: nextState,
        },
      }
      expect(stringSelector(rootState)).toEqual(state)
      expect(stringDataSelector(rootState)).toEqual(state.data)
    })
  })

  describe('updateValueFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
      }

      // Act
      const nextState = reducer(initialState, updateValueFailure(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: {
          string: nextState,
        },
      }
      expect(stringSelector(rootState)).toEqual(state)
      expect(stringDataSelector(rootState)).toEqual(state.data)
    })
  })

  describe('resetStringValue', () => {
    it('should properly set the error', () => {
      // Arrange
      const state = {
        ...initialState,
      }

      // Act
      const nextState = reducer(initialState, resetStringValue())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: {
          string: nextState,
        },
      }
      expect(stringSelector(rootState)).toEqual(state)
      expect(stringDataSelector(rootState)).toEqual(state.data)
    })
  })

  describe('setIsStringCompressed', () => {
    it('should properly set the state with isCompressed=true', () => {
      // Arrange

      const state = {
        ...initialState,
        isCompressed: true,
      }

      // Act
      const nextState = reducer(initialState, setIsStringCompressed(true))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: {
          string: nextState,
        },
      }
      expect(stringSelector(rootState)).toEqual(state)
      expect(stringDataSelector(rootState)).toEqual(state.data)
    })
  })

  describe('thunks', () => {
    describe('fetchString', () => {
      it('call both fetchString, getStringSuccess when fetch is successed', async () => {
        // Arrange
        const data = 'test'
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchString(''))

        // Assert
        const expectedActions = [
          getString(),
          getStringSuccess(responsePayload.data),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetchString', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }
        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchString(''))

        // Assert
        const expectedActions = [
          getString(),
          addErrorNotification(responsePayload as AxiosError),
          getStringFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchDownloadStringValue', () => {
      it('call both fetchDownloadStringValue, downloadStringSuccess when fetch is successed', async () => {
        // Arrange
        const data = 'test'
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchDownloadStringValue(''))

        // Assert
        const expectedActions = [downloadString(), downloadStringSuccess()]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetchDownloadStringValue', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }
        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchDownloadStringValue(''))

        // Assert
        const expectedActions = [
          downloadString(),
          addErrorNotification(responsePayload as AxiosError),
          downloadStringFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('updateStringValueAction', () => {
      it('succeed to fetch update string value', async () => {
        // Arrange
        const data = {
          keyName: 'stringKey',
          value: 'string value',
        }
        const responsePayload = { status: 200 }

        apiService.put = jest.fn().mockResolvedValue(responsePayload)
        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          updateStringValueAction(data.keyName, data.value, jest.fn()),
        )

        // Assert
        const expectedActions = [
          updateValue(),
          updateValueSuccess(data.value),
          refreshKeyInfo(),
          refreshKeyInfoSuccess(),
          updateSelectedKeyRefreshTime(MOCK_TIMESTAMP),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch update string value', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }
        apiService.put = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          updateStringValueAction('', '', jest.fn(), jest.fn()),
        )

        // Assert
        const expectedActions = [
          updateValue(),
          addErrorNotification(responsePayload as AxiosError),
          updateValueFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
