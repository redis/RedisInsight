import { cloneDeep } from 'lodash'
import { AxiosError } from 'axios'
import { apiService } from 'uiSrc/services'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
  mockStore,
} from 'uiSrc/utils/test-utils'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { bufferToString, stringToBuffer } from 'uiSrc/utils'
import { deleteRedisearchKeyFromList } from 'uiSrc/slices/browser/redisearch'
import { MOCK_TIMESTAMP } from 'uiSrc/mocks/data/dateNow'
import {
  defaultSelectedKeyAction,
  refreshKeyInfo,
  deleteSelectedKeySuccess,
  updateSelectedKeyRefreshTime,
  refreshKeyInfoSuccess,
  loadKeyInfoSuccess,
} from '../../browser/keys'
import reducer, {
  deleteHashFields,
  fetchMoreHashFields,
  fetchHashFields,
  initialState,
  loadMoreHashFields,
  loadMoreHashFieldsFailure,
  loadMoreHashFieldsSuccess,
  loadHashFields,
  loadHashFieldsFailure,
  loadHashFieldsSuccess,
  removeFieldsFromList,
  removeHashFields,
  removeHashFieldsFailure,
  removeHashFieldsSuccess,
  hashSelector,
  updateValue,
  updateValueSuccess,
  updateValueFailure,
  resetUpdateValue,
  addHashFieldsAction,
  updateFieldsInList,
  updateHashFieldsAction,
  refreshHashFieldsAction,
} from '../../browser/hash'
import {
  addErrorNotification,
  addMessageNotification,
} from '../../app/notifications'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
}))

let store: typeof mockedStore
let dateNow: jest.SpyInstance<number>

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('hash slice', () => {
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

  describe('loadHashFields', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, loadHashFields(['*', undefined]))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { hash: nextState },
      }
      expect(hashSelector(rootState)).toEqual(state)
    })
  })

  describe('loadHashFieldsSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const data = {
        keyName: 'hash',
        nextCursor: 0,
        fields: [{ field: 'hash field', value: 'hash value' }],
        total: 1,
      }

      const state = {
        ...initialState,
        loading: false,
        error: '',
        data: {
          ...data,
          key: data.keyName,
          match: '*',
        },
      }

      // Act
      const nextState = reducer(initialState, loadHashFieldsSuccess(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { hash: nextState },
      }
      expect(hashSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty fields', () => {
      // Arrange
      const data = {
        keyName: 'hash',
        nextCursor: 0,
        fields: [],
        total: 0,
      }

      const state = {
        ...initialState,
        loading: false,
        error: '',
        data: {
          ...data,
          key: data.keyName,
          match: '*',
        },
      }

      // Act
      const nextState = reducer(initialState, loadHashFieldsSuccess(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { hash: nextState },
      }
      expect(hashSelector(rootState)).toEqual(state)
    })
  })

  describe('loadHashFieldsFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
      }

      // Act
      const nextState = reducer(initialState, loadHashFieldsFailure(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { hash: nextState },
      }
      expect(hashSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMoreHashFields', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
        error: '',
      }

      // Act
      const nextState = reducer(initialState, loadMoreHashFields())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { hash: nextState },
      }
      expect(hashSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMoreHashFieldsSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const data = {
        keyName: 'hash',
        nextCursor: 0,
        fields: [{ field: 'hash field', value: 'hash value' }],
        total: 1,
      }

      const state = {
        ...initialState,
        loading: false,
        data: {
          ...initialState.data,
          ...data,
        },
      }

      // Act
      const nextState = reducer(initialState, loadMoreHashFieldsSuccess(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { hash: nextState },
      }
      expect(hashSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data = {
        keyName: 'hash',
        nextCursor: 0,
        fields: [],
        total: 0,
      }

      const state = {
        ...initialState,
        loading: false,
        data: {
          ...initialState.data,
          ...data,
        },
      }

      // Act
      const nextState = reducer(initialState, loadMoreHashFieldsSuccess(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { hash: nextState },
      }
      expect(hashSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMoreHashFieldsFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
      }

      // Act
      const nextState = reducer(initialState, loadMoreHashFieldsFailure(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { hash: nextState },
      }
      expect(hashSelector(rootState)).toEqual(state)
    })
  })

  describe('removeHashFields', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, removeHashFields())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { hash: nextState },
      }
      expect(hashSelector(rootState)).toEqual(state)
    })
  })

  describe('removeHashFieldsSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const initailStateRemove = {
        ...initialState,
        data: {
          ...initialState.data,
          fields: [{ field: 'hash field', value: 'hash value' }],
        },
      }

      // Act
      const nextState = reducer(initailStateRemove, removeHashFieldsSuccess())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { hash: nextState },
      }
      expect(hashSelector(rootState)).toEqual(initailStateRemove)
    })
  })

  describe('removeHashFieldsFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
      }

      // Act
      const nextState = reducer(initialState, removeHashFieldsFailure(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { hash: nextState },
      }
      expect(hashSelector(rootState)).toEqual(state)
    })
  })

  describe('removeFieldsFromList', () => {
    it('should properly set the error', () => {
      // Arrange
      const initialStateRemove = {
        ...initialState,
        data: {
          ...initialState.data,
          fields: [
            { field: stringToBuffer('hash field'), value: 'hash value' },
            { field: stringToBuffer('hash field2'), value: 'hash value' },
            { field: stringToBuffer('hash field3'), value: 'hash value' },
          ],
        },
      }

      const data = [stringToBuffer('hash field'), stringToBuffer('hash field3')]

      const state = {
        ...initialStateRemove,
        data: {
          ...initialStateRemove.data,
          total: initialStateRemove.data.total - 1,
          fields: [
            { field: stringToBuffer('hash field2'), value: 'hash value' },
          ],
        },
      }

      // Act
      const nextState = reducer(initialStateRemove, removeFieldsFromList(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { hash: nextState },
      }
      expect(hashSelector(rootState)).toEqual(state)
    })
  })

  describe('updateValue', () => {
    it('should properly set the state while updating a hash key', () => {
      // Arrange
      const state = {
        ...initialState,
        updateValue: {
          ...initialState.updateValue,
          loading: true,
          error: '',
        },
      }

      // Act
      const nextState = reducer(initialState, updateValue())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { hash: nextState },
      }
      expect(hashSelector(rootState)).toEqual(state)
    })
  })

  describe('updateValueSuccess', () => {
    it('should properly set the state after successfully updated hash key', () => {
      // Arrange

      const state = {
        ...initialState,
        updateValue: {
          ...initialState.updateValue,
          loading: false,
        },
      }

      // Act
      const nextState = reducer(initialState, updateValueSuccess())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { hash: nextState },
      }
      expect(hashSelector(rootState)).toEqual(state)
    })
  })

  describe('updateValueFailure', () => {
    it('should properly set the state on update hash key failure', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        updateValue: {
          ...initialState.updateValue,
          loading: false,
          error: data,
        },
      }

      // Act
      const nextState = reducer(initialState, updateValueFailure(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { hash: nextState },
      }
      expect(hashSelector(rootState)).toEqual(state)
    })
  })

  describe('resetUpdateValue', () => {
    it('should properly reset the state', () => {
      // Arrange;
      const state = {
        ...initialState,
        updateValue: {
          ...initialState.updateValue,
          loading: false,
          error: '',
        },
      }

      // Act
      const nextState = reducer(initialState, resetUpdateValue())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { hash: nextState },
      }
      expect(hashSelector(rootState)).toEqual(state)
    })
  })

  describe('thunks', () => {
    describe('fetchHashFields', () => {
      it('call fetchHashFields, loadHashFieldsSuccess when fetch is successed', async () => {
        // Arrange
        const data = {
          keyName: 'small set',
          nextCursor: 0,
          fields: [{ field: 'hash field', value: 'hash value' }],
          total: 3,
        }
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchHashFields(data.keyName, 0, 20, '*'))

        // Assert
        const expectedActions = [
          loadHashFields(['*', true]),
          loadHashFieldsSuccess(responsePayload.data),
          updateSelectedKeyRefreshTime(Date.now()),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchMoreHashFields', () => {
      it(
        'call fetchMoreHashFields, loadMoreHashFieldsSuccess,' +
          ' when fetch is successed',
        async () => {
          // Arrange
          const data = {
            keyName: 'hash',
            nextCursor: 0,
            fields: [{ field: 'hash field', value: 'hash value' }],
            total: 3,
          }
          const responsePayload = { data, status: 200 }

          apiService.post = jest.fn().mockResolvedValue(responsePayload)

          // Act
          await store.dispatch<any>(
            fetchMoreHashFields(data.keyName, 0, 20, '*'),
          )

          // Assert
          const expectedActions = [
            loadMoreHashFields(),
            loadMoreHashFieldsSuccess(responsePayload.data),
          ]

          expect(mockedStore.getActions()).toEqual(expectedActions)
        },
      )
    })

    describe('refreshHashFieldsAction', () => {
      it('succeed to refresh hash data', async () => {
        // Arrange
        const data = {
          keyName: 'small set',
          nextCursor: 0,
          fields: [{ field: 'hash field', value: 'hash value' }],
          total: 3,
        }
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(refreshHashFieldsAction(data.keyName))

        // Assert
        const expectedActions = [
          loadHashFields(['*', undefined]),
          loadHashFieldsSuccess(responsePayload.data),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('deleteHashFields', () => {
      it(
        'call removeHashFields, removeHashFieldsSuccess,' +
          ' and removeFieldsFromList when fetch is successed',
        async () => {
          // Arrange

          const key = stringToBuffer('key')
          const fields = ['hash field', 'hash field 2'].map((field) =>
            stringToBuffer(field),
          )
          const responsePayload = { status: 200, data: { affected: 2 } }
          const nextState = {
            ...initialStateDefault,
            browser: {
              keys: {
                ...initialStateDefault.browser.keys,
              },
              hash: {
                ...initialState,
                data: {
                  ...initialState.data,
                  total: 10,
                },
              },
            },
          }

          const mockedStore = mockStore(nextState)

          apiService.delete = jest.fn().mockResolvedValue(responsePayload)
          apiService.post = jest.fn().mockResolvedValue(responsePayload)

          // Act
          await mockedStore.dispatch<any>(deleteHashFields(key, fields))

          // Assert
          const expectedActions = [
            removeHashFields(),
            removeHashFieldsSuccess(),
            removeFieldsFromList(fields),
            refreshKeyInfo(),
            addMessageNotification(
              successMessages.REMOVED_KEY_VALUE(
                key,
                fields.map((field) => bufferToString(field)).join(''),
                'Field',
              ),
            ),
            refreshKeyInfoSuccess({ affected: 2 }),
            updateSelectedKeyRefreshTime(MOCK_TIMESTAMP),
          ]

          expect(mockedStore.getActions()).toEqual(expectedActions)
        },
      )

      it('succeed to delete all fields from hast', async () => {
        // Arrange

        const key = 'key'
        const fields = ['hash field', 'hash field 2']
        const responsePayload = { status: 200, data: { affected: 2 } }
        const nextState = {
          ...initialStateDefault,
          browser: {
            hash: {
              ...initialState,
              data: {
                ...initialState.data,
                total: 2,
              },
            },
          },
        }

        const mockedStore = mockStore(nextState)

        apiService.delete = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await mockedStore.dispatch<any>(deleteHashFields(key, fields))

        // Assert
        const expectedActions = [
          removeHashFields(),
          removeHashFieldsSuccess(),
          removeFieldsFromList(fields),
          deleteSelectedKeySuccess(),
          deleteRedisearchKeyFromList(key),
          addMessageNotification(successMessages.DELETED_KEY(key)),
        ]

        expect(mockedStore.getActions()).toEqual(expectedActions)
      })
    })

    describe('addHashFields', () => {
      const keyName = 'key'
      const fields = [
        { field: 'hash field', value: 'hash value' },
        { field: 'hash field 2', value: 'hash value 2' },
      ]
      it('succeed to add fields to hash', async () => {
        // Arrange
        const responsePayload = { status: 200 }
        apiService.put = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await mockedStore.dispatch<any>(
          addHashFieldsAction({ keyName, fields }),
        )

        // Assert
        const expectedActions = [
          updateValue(),
          updateValueSuccess(),
          defaultSelectedKeyAction(),
          loadKeyInfoSuccess({ affected: 2 }),
          updateSelectedKeyRefreshTime(MOCK_TIMESTAMP),
        ]

        expect(mockedStore.getActions()).toEqual(expectedActions)
      })
      it('failed to add fields to hash', async () => {
        // Arrange
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }
        apiService.put = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(addHashFieldsAction({ keyName, fields }))

        // Assert
        const expectedActions = [
          updateValue(),
          addErrorNotification(responsePayload as AxiosError),
          updateValueFailure(errorMessage),
        ]

        expect(mockedStore.getActions()).toEqual(expectedActions)
      })
    })

    describe('updateHashFieldsAction', () => {
      const keyName = 'key'
      const fields = [
        { field: 'hash field', value: 'hash value' },
        { field: 'hash field 2', value: 'hash value 2' },
      ]
      it('succeed to update fields in hash', async () => {
        // Arrange
        const responsePayload = { status: 200 }
        apiService.put = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(updateHashFieldsAction({ keyName, fields }))

        // Assert
        const expectedActions = [
          updateValue(),
          updateValueSuccess(),
          updateFieldsInList(fields),
          refreshKeyInfo(),
          refreshKeyInfoSuccess({ affected: 2 }),
          updateSelectedKeyRefreshTime(MOCK_TIMESTAMP),
        ]

        expect(mockedStore.getActions()).toEqual(expectedActions)
      })
      it('failed to update fields in hash', async () => {
        // Arrange
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }
        apiService.put = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await mockedStore.dispatch<any>(
          updateHashFieldsAction({ keyName, fields }),
        )

        // Assert
        const expectedActions = [
          updateValue(),
          addErrorNotification(responsePayload as AxiosError),
          updateValueFailure(errorMessage),
        ]

        expect(mockedStore.getActions()).toEqual(expectedActions)
      })
    })
  })
})
