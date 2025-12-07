import { AxiosError } from 'axios'
import { cloneDeep } from 'lodash'
import { apiService } from 'uiSrc/services'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
  mockStore,
} from 'uiSrc/utils/test-utils'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { GetRejsonRlResponseDto } from 'apiSrc/modules/browser/rejson-rl/dto'
import reducer, {
  initialState,
  loadRejsonBranch,
  loadRejsonBranchSuccess,
  loadRejsonBranchFailure,
  appendReJSONArrayItem,
  appendReJSONArrayItemSuccess,
  appendReJSONArrayItemFailure,
  setReJSONData,
  setReJSONDataSuccess,
  setReJSONDataFailure,
  removeRejsonKey,
  removeRejsonKeySuccess,
  removeRejsonKeyFailure,
  rejsonSelector,
  fetchReJSON,
  fetchVisualisationResults,
  setReJSONDataAction,
  appendReJSONArrayItemAction,
  removeReJSONKeyAction,
  JSON_LENGTH_TO_FORCE_RETRIEVE,
} from '../../browser/rejson'
import {
  addErrorNotification,
  addMessageNotification,
} from '../../app/notifications'
import { refreshKeyInfo } from '../../browser/keys'
import { EditorType } from 'uiSrc/slices/interfaces'
import { stringToBuffer } from 'uiSrc/utils'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
}))

let store: typeof mockedStore
let storeWithSelectedKey: typeof mockedStore
let defaultData: GetRejsonRlResponseDto
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()

  defaultData = {
    downloaded: false,
    path: '$',
    data: [
      { key: 'glossary', path: "['glossary']", cardinality: 2, type: 'object' },
    ],
    type: 'object',
  }

  const rootStateWithSelectedKey = {
    ...initialStateDefault,
    browser: {
      keys: {
        selectedKey: {
          data: {
            name: 'selectedKey',
          },
        },
      },
    },
  }

  storeWithSelectedKey = mockStore(rootStateWithSelectedKey)
})

describe('rejson slice', () => {
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

  describe('loadRejsonBranch', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, loadRejsonBranch())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: {
          rejson: nextState,
        },
      }
      expect(rejsonSelector(rootState)).toEqual(state)
    })
  })

  describe('loadRejsonBranchSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const state = {
        ...initialState,
        loading: false,
        data: defaultData,
      }

      // Act
      const nextState = reducer(
        initialState,
        loadRejsonBranchSuccess(defaultData),
      )

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: {
          rejson: nextState,
        },
      }
      expect(rejsonSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data: any = []

      const state = {
        ...initialState,
        loading: false,
        data,
      }

      // Act
      const nextState = reducer(initialState, loadRejsonBranchSuccess(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: {
          rejson: nextState,
        },
      }
      expect(rejsonSelector(rootState)).toEqual(state)
    })
  })

  describe('loadRejsonBranchFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
      }

      // Act
      const nextState = reducer(initialState, loadRejsonBranchFailure(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: {
          rejson: nextState,
        },
      }
      expect(rejsonSelector(rootState)).toEqual(state)
    })
  })

  describe('appendReJSONArrayItem', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, appendReJSONArrayItem())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: {
          rejson: nextState,
        },
      }
      expect(rejsonSelector(rootState)).toEqual(state)
    })
  })

  describe('appendReJSONArrayItemSuccess', () => {
    it('should properly set the state after append', () => {
      const state = {
        ...initialState,
        loading: false,
      }

      // Act
      const nextState = reducer(initialState, appendReJSONArrayItemSuccess())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: {
          rejson: nextState,
        },
      }
      expect(rejsonSelector(rootState)).toEqual(state)
    })
  })

  describe('appendReJSONArrayItemFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
      }

      // Act
      const nextState = reducer(
        initialState,
        appendReJSONArrayItemFailure(data),
      )

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: {
          rejson: nextState,
        },
      }
      expect(rejsonSelector(rootState)).toEqual(state)
    })
  })

  describe('setReJSONData', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, setReJSONData())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: {
          rejson: nextState,
        },
      }
      expect(rejsonSelector(rootState)).toEqual(state)
    })
  })

  describe('setReJSONDataSuccess', () => {
    it('should properly set the state after append', () => {
      const state = {
        ...initialState,
        loading: false,
      }

      // Act
      const nextState = reducer(initialState, setReJSONDataSuccess())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: {
          rejson: nextState,
        },
      }
      expect(rejsonSelector(rootState)).toEqual(state)
    })
  })

  describe('setReJSONDataFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
      }

      // Act
      const nextState = reducer(initialState, setReJSONDataFailure(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: {
          rejson: nextState,
        },
      }
      expect(rejsonSelector(rootState)).toEqual(state)
    })
  })

  describe('removeRejsonKey', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, removeRejsonKey())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: {
          rejson: nextState,
        },
      }
      expect(rejsonSelector(rootState)).toEqual(state)
    })
  })

  describe('removeRejsonKeySuccess', () => {
    it('should properly set the state after append', () => {
      const state = {
        ...initialState,
        loading: false,
      }

      // Act
      const nextState = reducer(initialState, removeRejsonKeySuccess())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: {
          rejson: nextState,
        },
      }
      expect(rejsonSelector(rootState)).toEqual(state)
    })
  })

  describe('removeRejsonKeyFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
      }

      // Act
      const nextState = reducer(initialState, removeRejsonKeyFailure(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: {
          rejson: nextState,
        },
      }
      expect(rejsonSelector(rootState)).toEqual(state)
    })
  })

  describe('thunks', () => {
    describe('fetchReJSON', () => {
      it('call both fetchReJSON and loadRejsonBranchSuccess when fetch is successed', async () => {
        // Arrange
        const key = 'key'
        const path = '$'

        const responsePayload = { data: defaultData, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchReJSON(key, path))

        // Assert
        const expectedActions = [
          loadRejsonBranch(),
          loadRejsonBranchSuccess(responsePayload.data),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('call both fetchReJSON and loadRejsonBranchFailure when fetch is fail', async () => {
        // Arrange
        const key = 'key'
        const path = '$'
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
        await store.dispatch<any>(fetchReJSON(key, path))

        // Assert
        const expectedActions = [
          loadRejsonBranch(),
          loadRejsonBranchFailure(responsePayload.response.data.message),
          addErrorNotification(responsePayload as AxiosError),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('should set forceRetrieve to true when editorType is Text and the JSON is big enough', async () => {
        const key = stringToBuffer('key')
        const path = '$'
        const responsePayload = { data: {}, status: 200 }

        const apiServicePostMock = jest.fn()
        apiService.post = apiServicePostMock.mockResolvedValue(responsePayload)

        const customState = {
          ...store.getState(),
          browser: {
            ...store.getState().browser,
            rejson: {
              ...store.getState().browser.rejson,
              editorType: EditorType.Text,
            },
          },
        }

        const storeWithCustomState = mockStore(customState)

        const lengthAboveThreshold = JSON_LENGTH_TO_FORCE_RETRIEVE + 1
        await storeWithCustomState.dispatch<any>(
          fetchReJSON(key, path, lengthAboveThreshold),
        )

        const postPayload = apiServicePostMock.mock.calls[0][1]

        expect(postPayload.forceRetrieve).toBe(true)
      })

      it('should set forceRetrieve to true when length is undefined and editorType is Default', async () => {
        const key = stringToBuffer('key')
        const path = '$'
        const responsePayload = { data: {}, status: 200 }

        const apiServicePostMock = jest.fn()
        apiService.post = apiServicePostMock.mockResolvedValue(responsePayload)

        const customState = {
          ...store.getState(),
          browser: {
            ...store.getState().browser,
            rejson: {
              ...store.getState().browser.rejson,
              editorType: EditorType.Default,
            },
          },
        }

        const storeWithCustomState = mockStore(customState)

        await storeWithCustomState.dispatch<any>(fetchReJSON(key, path)) // no length

        const postPayload = apiServicePostMock.mock.calls[0][1]
        expect(postPayload.forceRetrieve).toBe(true)
      })

      it('should set forceRetrieve to true when length is below threshold and editorType is Default', async () => {
        const key = stringToBuffer('key')
        const path = '$'
        const responsePayload = { data: {}, status: 200 }

        const apiServicePostMock = jest.fn()
        apiService.post = apiServicePostMock.mockResolvedValue(responsePayload)

        const customState = {
          ...store.getState(),
          browser: {
            ...store.getState().browser,
            rejson: {
              ...store.getState().browser.rejson,
              editorType: EditorType.Default,
            },
          },
        }

        const storeWithCustomState = mockStore(customState)

        const smallLength = 1
        expect(smallLength).toBeLessThan(JSON_LENGTH_TO_FORCE_RETRIEVE)

        await storeWithCustomState.dispatch<any>(
          fetchReJSON(key, path, smallLength),
        )

        const postPayload = apiServicePostMock.mock.calls[0][1]
        expect(postPayload.forceRetrieve).toBe(true)
      })

      it('should set forceRetrieve to false when length is above threshold and editorType is Default', async () => {
        const key = stringToBuffer('key')
        const path = '$'
        const responsePayload = { data: {}, status: 200 }

        const apiServicePostMock = jest.fn()
        apiService.post = apiServicePostMock.mockResolvedValue(responsePayload)

        const customState = {
          ...store.getState(),
          browser: {
            ...store.getState().browser,
            rejson: {
              ...store.getState().browser.rejson,
              editorType: EditorType.Default,
            },
          },
        }

        const storeWithCustomState = mockStore(customState)

        const lengthAboveThreshold = JSON_LENGTH_TO_FORCE_RETRIEVE + 1
        await storeWithCustomState.dispatch<any>(
          fetchReJSON(key, path, lengthAboveThreshold),
        )

        const postPayload = apiServicePostMock.mock.calls[0][1]
        expect(postPayload.forceRetrieve).toBe(false)
      })
    })

    describe('setReJSONDataAction', () => {
      it('succeed to fetch set json data', async () => {
        // Arrange
        const key = 'key'
        const path = '$'
        const data = '{}'

        const responsePayload = { status: 200 }

        apiService.patch = jest.fn().mockResolvedValue(responsePayload)

        const responsePayload2 = { data: defaultData, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload2)

        // Act
        await store.dispatch<any>(setReJSONDataAction(key, path, data))

        // Assert
        const expectedActions = [
          setReJSONData(),
          setReJSONDataSuccess(),
          loadRejsonBranch(),
          refreshKeyInfo(),
        ]
        expect(store.getActions().slice(0, expectedActions.length)).toEqual(
          expectedActions,
        )
      })

      it('failed to fetch set json data', async () => {
        // Arrange
        const key = 'key'
        const path = '$'
        const errorMessage = 'some error'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.patch = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(setReJSONDataAction(key, path, '{'))

        // Assert
        const expectedActions = [
          setReJSONData(),
          setReJSONDataFailure(responsePayload.response.data.message),
          addErrorNotification(responsePayload as AxiosError),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('appendReJSONArrayItemAction', () => {
      it('succeed to fetch append array data', async () => {
        // Arrange
        const key = 'key'
        const path = '$'
        const data = '123'

        const responsePayload = { status: 200 }

        apiService.patch = jest.fn().mockResolvedValue(responsePayload)

        const responsePayload2 = { data: defaultData, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload2)

        // Act
        await store.dispatch<any>(appendReJSONArrayItemAction(key, path, data))

        // Assert
        const expectedActions = [
          appendReJSONArrayItem(),
          appendReJSONArrayItemSuccess(),
          loadRejsonBranch(),
          refreshKeyInfo(),
        ]
        expect(store.getActions().slice(0, expectedActions.length)).toEqual(
          expectedActions,
        )
      })

      it('failed to fetch append array data', async () => {
        // Arrange
        const key = 'key'
        const path = '$'
        const errorMessage = 'some error'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.patch = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(appendReJSONArrayItemAction(key, path, '{'))

        // Assert
        const expectedActions = [
          appendReJSONArrayItem(),
          appendReJSONArrayItemFailure(responsePayload.response.data.message),
          addErrorNotification(responsePayload as AxiosError),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('removeReJSONKeyAction', () => {
      it('succeed to fetch remove json key', async () => {
        // Arrange
        const key = 'key'
        const path = '$'
        const jsonKeyName = 'jsonKeyName'

        const responsePayload = { status: 200 }

        apiService.delete = jest.fn().mockResolvedValue(responsePayload)

        const responsePayload2 = { data: defaultData, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload2)

        // Act
        await store.dispatch<any>(removeReJSONKeyAction(key, path, jsonKeyName))

        // Assert
        const expectedActions = [
          removeRejsonKey(),
          removeRejsonKeySuccess(),
          loadRejsonBranch(),
          refreshKeyInfo(),
          addMessageNotification(
            successMessages.REMOVED_KEY_VALUE(key, jsonKeyName, 'JSON key'),
          ),
        ]
        expect(store.getActions().slice(0, expectedActions.length)).toEqual(
          expectedActions,
        )
      })

      it('failed to fetch remove json key', async () => {
        // Arrange
        const key = 'key'
        const path = '$'
        const errorMessage = 'some error'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.delete = jest.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(removeReJSONKeyAction(key, path))

        // Assert
        const expectedActions = [
          removeRejsonKey(),
          removeRejsonKeyFailure(responsePayload.response.data.message),
          addErrorNotification(responsePayload as AxiosError),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchVisualisationResults', () => {
      it('call both fetchVisualisationResults and loadRejsonBranchSuccess when fetch is successed', async () => {
        // Arrange
        const path = '$'

        const responsePayload = { data: defaultData, status: 200 }

        const expectedResult = defaultData

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        const result = await storeWithSelectedKey.dispatch<any>(
          fetchVisualisationResults(path),
        )

        // Assert
        expect(result).toEqual(expectedResult)
      })
    })
  })
})
