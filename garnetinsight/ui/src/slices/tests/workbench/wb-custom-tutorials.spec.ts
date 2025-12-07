import { cloneDeep } from 'lodash'
import { AxiosError } from 'axios'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import {
  IBulkActionOverview,
  IEnablementAreaItem,
} from 'uiSrc/slices/interfaces'
import { MOCK_CUSTOM_TUTORIALS, MOCK_TUTORIALS_ITEMS } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'

import {
  addErrorNotification,
  addMessageNotification,
} from 'uiSrc/slices/app/notifications'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { getFileNameFromPath } from 'uiSrc/utils/pathUtil'
import reducer, {
  initialState,
  getWBCustomTutorials,
  getWBCustomTutorialsSuccess,
  getWBCustomTutorialsFailure,
  uploadWbCustomTutorial,
  uploadWBCustomTutorialSuccess,
  uploadWBCustomTutorialFailure,
  deleteWbCustomTutorial,
  deleteWBCustomTutorialSuccess,
  deleteWBCustomTutorialFailure,
  uploadCustomTutorial,
  fetchCustomTutorials,
  deleteCustomTutorial,
  workbenchCustomTutorialsSelector,
  uploadDataBulk,
  uploadDataBulkSuccess,
  uploadDataBulkFailed,
  uploadDataBulkAction,
  defaultItems,
  setWbCustomTutorialsState,
} from '../../workbench/wb-custom-tutorials'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
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

  describe('getWBCustomTutorials', () => {
    it('should properly set loading', () => {
      // Arrange
      const loading = true
      const state = {
        ...initialState,
        loading,
      }

      // Act
      const nextState = reducer(initialState, getWBCustomTutorials())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          customTutorials: nextState,
        },
      })

      expect(workbenchCustomTutorialsSelector(rootState)).toEqual(state)
    })
  })

  describe('getWBCustomTutorialsSuccess', () => {
    it('should properly set state after success', () => {
      // Arrange
      const customTutorials: IEnablementAreaItem = MOCK_CUSTOM_TUTORIALS
      const state = {
        ...initialState,
        items: [customTutorials],
      }

      // Act
      const nextState = reducer(
        initialState,
        getWBCustomTutorialsSuccess(customTutorials),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          customTutorials: nextState,
        },
      })

      expect(workbenchCustomTutorialsSelector(rootState)).toEqual(state)
    })
  })

  describe('getWBCustomTutorialsFailure', () => {
    it('should properly set error', () => {
      // Arrange
      const error = 'error'
      const state = {
        ...initialState,
        loading: false,
        items: defaultItems,
        error,
      }

      // Act
      const nextState = reducer(
        initialState,
        getWBCustomTutorialsFailure(error),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          customTutorials: nextState,
        },
      })

      expect(workbenchCustomTutorialsSelector(rootState)).toEqual(state)
    })
  })

  describe('uploadWbCustomTutorial', () => {
    it('should properly set loading', () => {
      // Arrange
      const loading = true
      const state = {
        ...initialState,
        loading,
      }

      // Act
      const nextState = reducer(initialState, uploadWbCustomTutorial())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          customTutorials: nextState,
        },
      })

      expect(workbenchCustomTutorialsSelector(rootState)).toEqual(state)
    })
  })

  describe('uploadWBCustomTutorialSuccess', () => {
    it('should properly set state after success', () => {
      // Arrange
      const items: IEnablementAreaItem[] = MOCK_TUTORIALS_ITEMS
      const currentState = {
        ...initialState,
        items: defaultItems,
      }
      const state = {
        ...initialState,
        items: [
          {
            ...defaultItems[0],
            children: [items[0], ...(defaultItems[0].children as [])],
          },
        ],
      }

      // Act
      const nextState = reducer(
        currentState,
        uploadWBCustomTutorialSuccess(items[0]),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          customTutorials: nextState,
        },
      })

      expect(workbenchCustomTutorialsSelector(rootState)).toEqual(state)
    })
  })

  describe('uploadWBCustomTutorialFailure', () => {
    it('should properly set error', () => {
      // Arrange
      const error = 'error'
      const state = {
        ...initialState,
        loading: false,
        error,
      }

      // Act
      const nextState = reducer(
        initialState,
        uploadWBCustomTutorialFailure(error),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          customTutorials: nextState,
        },
      })

      expect(workbenchCustomTutorialsSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteWbCustomTutorial', () => {
    it('should properly set loading', () => {
      // Arrange
      const state = {
        ...initialState,
        deleting: true,
      }

      // Act
      const nextState = reducer(initialState, deleteWbCustomTutorial())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          customTutorials: nextState,
        },
      })

      expect(workbenchCustomTutorialsSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteWBCustomTutorialSuccess', () => {
    it('should properly set state after success', () => {
      // Arrange
      const id = 'tutorials'
      const currentState = {
        ...initialState,
        items: [
          {
            ...defaultItems[0],
            children: MOCK_TUTORIALS_ITEMS,
          },
        ],
      }

      const state = {
        ...initialState,
        items: [
          {
            ...defaultItems[0],
            children: currentState.items[0].children.slice(1),
          },
        ],
      }

      // Act
      const nextState = reducer(currentState, deleteWBCustomTutorialSuccess(id))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          customTutorials: nextState,
        },
      })

      expect(workbenchCustomTutorialsSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteWBCustomTutorialFailure', () => {
    it('should properly set error', () => {
      // Arrange
      const error = 'error'
      const state = {
        ...initialState,
        deleting: false,
        error,
      }

      // Act
      const nextState = reducer(
        initialState,
        deleteWBCustomTutorialFailure(error),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          customTutorials: nextState,
        },
      })

      expect(workbenchCustomTutorialsSelector(rootState)).toEqual(state)
    })
  })

  describe('uploadDataBulk', () => {
    it('should properly set loading for paths', () => {
      // Arrange
      const state = {
        ...initialState,
        bulkUpload: {
          ...initialState.bulkUpload,
          pathsInProgress: ['data/data'],
        },
      }

      // Act
      const nextState = reducer(initialState, uploadDataBulk('data/data'))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          customTutorials: nextState,
        },
      })

      expect(workbenchCustomTutorialsSelector(rootState)).toEqual(state)
    })
  })

  describe('uploadDataBulk', () => {
    it('should properly remove path from loading', () => {
      // Arrange
      const currentState = {
        ...initialState,
        bulkUpload: {
          ...initialState.bulkUpload,
          pathsInProgress: ['data/data', 'data/another'],
        },
      }

      const state = {
        ...initialState,
        bulkUpload: {
          ...initialState.bulkUpload,
          pathsInProgress: ['data/another'],
        },
      }

      // Act
      const nextState = reducer(
        currentState,
        uploadDataBulkSuccess('data/data'),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          customTutorials: nextState,
        },
      })

      expect(workbenchCustomTutorialsSelector(rootState)).toEqual(state)
    })
  })

  describe('uploadDataBulkFailed', () => {
    it('should properly remove path from loading', () => {
      // Arrange
      const currentState = {
        ...initialState,
        bulkUpload: {
          ...initialState.bulkUpload,
          pathsInProgress: ['data/data'],
        },
      }

      const state = {
        ...initialState,
        bulkUpload: {
          ...initialState.bulkUpload,
          pathsInProgress: [],
        },
      }

      // Act
      const nextState = reducer(currentState, uploadDataBulkFailed('data/data'))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        workbench: {
          customTutorials: nextState,
        },
      })

      expect(workbenchCustomTutorialsSelector(rootState)).toEqual(state)
    })

    describe('setWbCustomTutorialsState', () => {
      it('should properly set open state', () => {
        // Arrange
        const currentState = {
          ...initialState,
          items: [
            {
              ...defaultItems[0],
              args: {
                initialIsOpen: false,
              },
              children: MOCK_TUTORIALS_ITEMS,
            },
          ],
        }

        const state = {
          ...initialState,
          items: [
            {
              ...defaultItems[0],
              args: {
                defaultInitialIsOpen: false,
                initialIsOpen: true,
              },
              children: MOCK_TUTORIALS_ITEMS,
            },
          ],
        }

        // Act
        const nextState = reducer(currentState, setWbCustomTutorialsState(true))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          workbench: {
            customTutorials: nextState,
          },
        })

        expect(workbenchCustomTutorialsSelector(rootState)).toEqual(state)
      })

      it('should properly return open state', () => {
        // Arrange
        const currentState = {
          ...initialState,
          items: [
            {
              ...defaultItems[0],
              args: {
                defaultInitialIsOpen: false,
                initialIsOpen: true,
              },
              children: MOCK_TUTORIALS_ITEMS,
            },
          ],
        }

        const state = {
          ...initialState,
          items: [
            {
              ...defaultItems[0],
              args: {
                defaultInitialIsOpen: false,
                initialIsOpen: false,
              },
              children: MOCK_TUTORIALS_ITEMS,
            },
          ],
        }

        // Act
        const nextState = reducer(currentState, setWbCustomTutorialsState())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          workbench: {
            customTutorials: nextState,
          },
        })

        expect(workbenchCustomTutorialsSelector(rootState)).toEqual(state)
      })
    })
  })

  // thunks

  describe('fetchCustomTutorials', () => {
    it('succeed to fetch tutorials items', async () => {
      // Arrange
      const data = MOCK_CUSTOM_TUTORIALS
      const responsePayload = { status: 200, data }

      apiService.get = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(fetchCustomTutorials(jest.fn()))

      // Assert
      const expectedActions = [
        getWBCustomTutorials(),
        getWBCustomTutorialsSuccess(data),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })

    it('failed to fetch tutorials items', async () => {
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
      await store.dispatch<any>(fetchCustomTutorials())

      // Assert
      const expectedActions = [
        getWBCustomTutorials(),
        getWBCustomTutorialsFailure(errorMessage),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })
  })

  describe('uploadCustomTutorial', () => {
    it('succeed to upload tutorial', async () => {
      // Arrange
      const data = {}
      const formData = new FormData()
      formData.append('name', 'TutorialName')
      formData.append('link', 'https://odkawokd.com')
      const responsePayload = { status: 200, data }

      apiService.post = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(uploadCustomTutorial(formData, jest.fn()))

      // Assert
      const expectedActions = [
        uploadWbCustomTutorial(),
        uploadWBCustomTutorialSuccess(data),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })

    it('failed to fetch tutorials items', async () => {
      // Arrange
      const formData = new FormData()
      const errorMessage = 'Something was wrong!'
      const responsePayload = {
        response: {
          status: 500,
          data: { message: errorMessage },
        },
      }
      apiService.post = jest.fn().mockRejectedValue(responsePayload)

      // Act
      await store.dispatch<any>(uploadCustomTutorial(formData))

      // Assert
      const expectedActions = [
        uploadWbCustomTutorial(),
        uploadWBCustomTutorialFailure(errorMessage),
        addErrorNotification(responsePayload as AxiosError),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })
  })

  describe('deleteCustomTutorial', () => {
    it('succeed to delete tutorial', async () => {
      // Arrange
      const id = '213123-13123123-123'
      const responsePayload = { status: 200 }

      apiService.delete = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(deleteCustomTutorial(id))

      // Assert
      const expectedActions = [
        deleteWbCustomTutorial(),
        deleteWBCustomTutorialSuccess(id),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })

    it('failed to delete tutorial', async () => {
      // Arrange
      const errorMessage = 'Something was wrong!'
      const responsePayload = {
        response: {
          status: 500,
          data: { message: errorMessage },
        },
      }
      apiService.delete = jest.fn().mockRejectedValue(responsePayload)

      // Act
      await store.dispatch<any>(deleteCustomTutorial('1'))

      // Assert
      const expectedActions = [
        deleteWbCustomTutorial(),
        deleteWBCustomTutorialFailure(errorMessage),
        addErrorNotification(responsePayload as AxiosError),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })
  })

  describe('uploadDataBulkAction', () => {
    it('succeed to upload data', async () => {
      // Arrange
      const instanceId = '1'
      const path = 'data/data'
      const data = {}
      const responsePayload = { status: 200, data }

      apiService.post = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(uploadDataBulkAction(instanceId, path))

      // Assert
      const expectedActions = [
        uploadDataBulk(path),
        uploadDataBulkSuccess(path),
        addMessageNotification(
          successMessages.UPLOAD_DATA_BULK(
            data as IBulkActionOverview,
            getFileNameFromPath(path),
          ),
        ),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })

    it('failed to delete tutorial', async () => {
      // Arrange
      const instanceId = '1'
      const path = 'data/data'
      const errorMessage = 'Something was wrong!'
      const responsePayload = {
        response: {
          status: 500,
          data: { message: errorMessage },
        },
      }
      apiService.post = jest.fn().mockRejectedValue(responsePayload)

      // Act
      await store.dispatch<any>(uploadDataBulkAction(instanceId, path))

      // Assert
      const expectedActions = [
        uploadDataBulk(path),
        uploadDataBulkFailed(path),
        addErrorNotification(responsePayload as AxiosError),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })
  })
})
