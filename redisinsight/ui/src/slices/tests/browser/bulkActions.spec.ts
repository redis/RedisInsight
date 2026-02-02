import { cloneDeep } from 'lodash'
import { AxiosError } from 'axios'
import { BulkActionsStatus, BulkActionsType, KeyTypes } from 'uiSrc/constants'
import reducer, {
  bulkActionsSelector,
  initialState,
  toggleBulkDeleteActionTriggered,
  toggleBulkActions,
  setBulkActionConnected,
  setLoading,
  setBulkActionType,
  setDeleteOverview,
  bulkActionsDeleteOverviewSelector,
  bulkActionsDeleteSelector,
  disconnectBulkDeleteAction,
  bulkDeleteSuccess,
  setBulkDeleteStartAgain,
  setBulkUploadStartAgain,
  setBulkDeleteLoading,
  setBulkDeleteFilter,
  setBulkDeleteSearch,
  setBulkDeleteKeyCount,
  bulkUpload,
  bulkUploadSuccess,
  bulkUploadFailed,
  bulkUploadDataAction,
  setDeleteOverviewStatus,
  bulkImportDefaultData,
  bulkImportDefaultDataSuccess,
  bulkImportDefaultDataFailed,
  bulkImportDefaultDataAction,
} from 'uiSrc/slices/browser/bulkActions'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import { apiService } from 'uiSrc/services'
import {
  addErrorNotification,
  addMessageNotification,
} from 'uiSrc/slices/app/notifications'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { IBulkActionOverview } from 'uiSrc/slices/interfaces'

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('bulkActions slice', () => {
  describe('reducer, actions and selectors', () => {
    it('should return the initial state on first run', () => {
      // Arrange
      const nextState = initialState

      // Act
      const result = reducer(undefined, {})

      // Assert
      expect(result).toEqual(nextState)
    })

    describe('setBulkDeleteStartAgain', () => {
      it('should properly set state', () => {
        const currentState = {
          ...initialState,
          isConnected: true,
          bulkDelete: {
            overview: {
              id: '123',
            },
            isActionTriggered: true,
          },
        }

        // Arrange
        const state = {
          ...initialState,
          bulkDelete: {
            ...initialState.bulkDelete,
          },
        }

        // Act
        const nextState = reducer(currentState, setBulkDeleteStartAgain())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          browser: { bulkActions: nextState },
        })
        expect(bulkActionsSelector(rootState)).toEqual(state)
      })
    })

    describe('setBulkUploadStartAgain', () => {
      it('should properly set state', () => {
        const currentState = {
          ...initialState,
          isConnected: true,
          bulkDelete: {
            isActionTriggered: true,
          },
          bulkUpload: {
            fileName: 'file.ts',
            overview: {
              id: '123123',
            },
          },
        }

        // Arrange
        const state = {
          ...initialState,
          bulkDelete: {
            isActionTriggered: true,
          },
          bulkUpload: {
            ...initialState.bulkUpload,
          },
        }

        // Act
        const nextState = reducer(currentState, setBulkUploadStartAgain())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          browser: { bulkActions: nextState },
        })
        expect(bulkActionsSelector(rootState)).toEqual(state)
      })
    })

    describe('toggleBulkActions', () => {
      it('should properly set state', () => {
        const currentState = {
          ...initialState,
          isShowBulkActions: true,
        }

        // Arrange
        const state = {
          ...initialState,
          isShowBulkActions: false,
        }

        // Act
        const nextState = reducer(currentState, toggleBulkActions())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          browser: { bulkActions: nextState },
        })
        expect(bulkActionsSelector(rootState)).toEqual(state)
      })
    })

    describe('setBulkActionConnected', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState,
          isConnected: true,
        }

        // Act
        const nextState = reducer(initialState, setBulkActionConnected(true))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          browser: { bulkActions: nextState },
        })
        expect(bulkActionsSelector(rootState)).toEqual(state)
      })
    })

    describe('setLoading', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState,
          loading: true,
        }

        // Act
        const nextState = reducer(initialState, setLoading(true))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          browser: { bulkActions: nextState },
        })
        expect(bulkActionsSelector(rootState)).toEqual(state)
      })
    })

    describe('setBulkDeleteLoading', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState,
          bulkDelete: {
            ...initialState.bulkDelete,
            loading: true,
          },
        }

        // Act
        const nextState = reducer(initialState, setBulkDeleteLoading(true))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          browser: { bulkActions: nextState },
        })
        expect(bulkActionsSelector(rootState)).toEqual(state)
      })
    })

    describe('setBulkActionType', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState,
          selectedBulkAction: {
            ...initialState.selectedBulkAction,
            type: BulkActionsType.Delete,
          },
        }

        // Act
        const nextState = reducer(
          initialState,
          setBulkActionType(BulkActionsType.Delete),
        )

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          browser: { bulkActions: nextState },
        })
        expect(bulkActionsSelector(rootState)).toEqual(state)
      })
    })

    describe('toggleBulkDeleteActionTriggered', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState,
          bulkDelete: {
            ...initialState.bulkDelete,
            isActionTriggered: true,
          },
        }

        // Act
        const nextState = reducer(
          initialState,
          toggleBulkDeleteActionTriggered(),
        )

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          browser: { bulkActions: nextState },
        })
        expect(bulkActionsSelector(rootState)).toEqual(state)
      })
    })

    describe('setBulkDeleteFilter', () => {
      it('should properly set filter', () => {
        // Arrange
        const state = {
          ...initialState.bulkDelete,
          filter: KeyTypes.Hash,
        }

        // Act
        const nextState = reducer(
          initialState,
          setBulkDeleteFilter(KeyTypes.Hash),
        )

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          browser: { bulkActions: nextState },
        })
        expect(bulkActionsDeleteSelector(rootState)).toEqual(state)
      })

      it('should properly set filter to null', () => {
        // Arrange
        const currentState = {
          ...initialState,
          bulkDelete: {
            ...initialState.bulkDelete,
            filter: KeyTypes.Hash,
          },
        }

        // Act
        const nextState = reducer(currentState, setBulkDeleteFilter(null))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          browser: { bulkActions: nextState },
        })
        expect(bulkActionsDeleteSelector(rootState).filter).toBeNull()
      })
    })

    describe('setBulkDeleteSearch', () => {
      it('should properly set search pattern', () => {
        // Arrange
        const searchPattern = 'user:session:*'

        // Act
        const nextState = reducer(
          initialState,
          setBulkDeleteSearch(searchPattern),
        )

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          browser: { bulkActions: nextState },
        })
        expect(bulkActionsDeleteSelector(rootState).search).toEqual(
          searchPattern,
        )
      })
    })

    describe('setBulkDeleteKeyCount', () => {
      it('should properly set key count', () => {
        // Arrange
        const keyCount = 42

        // Act
        const nextState = reducer(initialState, setBulkDeleteKeyCount(keyCount))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          browser: { bulkActions: nextState },
        })
        expect(bulkActionsDeleteSelector(rootState).keyCount).toEqual(keyCount)
      })

      it('should properly set key count to null', () => {
        // Arrange
        const currentState = {
          ...initialState,
          bulkDelete: {
            ...initialState.bulkDelete,
            keyCount: 100,
          },
        }

        // Act
        const nextState = reducer(currentState, setBulkDeleteKeyCount(null))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          browser: { bulkActions: nextState },
        })
        expect(bulkActionsDeleteSelector(rootState).keyCount).toBeNull()
      })
    })

    describe('setDeleteOverview', () => {
      it('should properly set state', () => {
        // Arrange
        const data = {
          id: 1,
          databaseId: '1',
          duration: 300,
          status: 'completed',
          type: BulkActionsType.Delete,
          summary: { processed: 1, succeed: 1, failed: 0, errors: [] },
        }

        const overview = {
          ...data,
        }

        // Act
        const nextState = reducer(initialState, setDeleteOverview(data))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          browser: { bulkActions: nextState },
        })
        expect(bulkActionsDeleteOverviewSelector(rootState)).toEqual(overview)
      })
    })

    describe('setDeleteOverviewStatus', () => {
      it('should properly set state', () => {
        // Arrange
        const currentState = {
          ...initialState,
          bulkDelete: {
            ...initialState.bulkDelete,
            overview: {
              id: 1,
              databaseId: '1',
              duration: 300,
              status: 'inprogress',
              type: BulkActionsType.Delete,
              summary: { processed: 1, succeed: 1, failed: 0, errors: [] },
            },
          },
        }

        const overviewState = {
          ...currentState.bulkDelete.overview,
          status: BulkActionsStatus.Disconnected,
        }

        // Act
        const nextState = reducer(
          currentState,
          setDeleteOverviewStatus(BulkActionsStatus.Disconnected),
        )

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          browser: { bulkActions: nextState },
        })
        expect(bulkActionsDeleteOverviewSelector(rootState)).toEqual(
          overviewState,
        )
      })
    })

    describe('disconnectBulkDeleteAction', () => {
      it('should properly set state', () => {
        // Arrange
        const currentState = {
          ...initialState,
          isConnected: true,
          bulkDelete: {
            ...initialState.bulkDelete,
            loading: true,
            isActionTriggered: true,
          },
        }

        // Act
        const nextState = reducer(currentState, disconnectBulkDeleteAction())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          browser: { bulkActions: nextState },
        })
        expect(bulkActionsSelector(rootState)).toEqual(initialState)
      })
    })

    describe('bulkDeleteSuccess', () => {
      it('should properly set state', () => {
        // Arrange
        const currentState = {
          ...initialState,
          bulkDelete: {
            ...initialState.bulkDelete,
            loading: true,
          },
        }

        // Act
        const nextState = reducer(currentState, bulkDeleteSuccess())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          browser: { bulkActions: nextState },
        })
        expect(bulkActionsSelector(rootState)).toEqual(initialState)
      })
    })

    describe('bulkUpload', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState,
          bulkUpload: {
            ...initialState.bulkUpload,
            loading: true,
          },
        }

        // Act
        const nextState = reducer(initialState, bulkUpload())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          browser: { bulkActions: nextState },
        })
        expect(bulkActionsSelector(rootState)).toEqual(state)
      })

      describe('bulkUploadSuccess', () => {
        it('should properly set state', () => {
          // Arrange
          const currentState = {
            ...initialState,
            bulkUpload: {
              ...initialState.bulkUpload,
              loading: true,
            },
          }

          const state = {
            ...initialState,
            bulkUpload: {
              ...initialState.bulkUpload,
              loading: false,
              overview: {},
              fileName: 'file.txt',
            },
          }

          // Act
          const nextState = reducer(
            currentState,
            bulkUploadSuccess({ data: {}, fileName: 'file.txt' }),
          )

          // Assert
          const rootState = Object.assign(initialStateDefault, {
            browser: { bulkActions: nextState },
          })
          expect(bulkActionsSelector(rootState)).toEqual(state)
        })
      })

      describe('bulkUploadFailed', () => {
        it('should properly set state', () => {
          // Arrange
          const state = {
            ...initialState,
            bulkUpload: {
              ...initialState.bulkUpload,
              loading: false,
              error: 'error',
            },
          }

          // Act
          const nextState = reducer(initialState, bulkUploadFailed('error'))

          // Assert
          const rootState = Object.assign(initialStateDefault, {
            browser: { bulkActions: nextState },
          })
          expect(bulkActionsSelector(rootState)).toEqual(state)
        })
      })
    })

    describe('bulkImportDefaultData', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState,
          loading: true,
        }

        // Act
        const nextState = reducer(initialState, bulkImportDefaultData())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          browser: { bulkActions: nextState },
        })
        expect(bulkActionsSelector(rootState)).toEqual(state)
      })

      describe('bulkImportDefaultDataSuccess', () => {
        it('should properly set state', () => {
          // Arrange
          const currentState = {
            ...initialState,
            loading: true,
          }

          const state = {
            ...initialState,
            loading: false,
          }

          // Act
          const nextState = reducer(
            currentState,
            bulkImportDefaultDataSuccess(),
          )

          // Assert
          const rootState = Object.assign(initialStateDefault, {
            browser: { bulkActions: nextState },
          })
          expect(bulkActionsSelector(rootState)).toEqual(state)
        })
      })

      describe('bulkImportDefaultDataFailed', () => {
        it('should properly set state', () => {
          // Arrange
          const currentState = {
            ...initialState,
            loading: true,
          }

          const state = {
            ...initialState,
            loading: false,
          }

          // Act
          const nextState = reducer(currentState, bulkImportDefaultDataFailed())

          // Assert
          const rootState = Object.assign(initialStateDefault, {
            browser: { bulkActions: nextState },
          })
          expect(bulkActionsSelector(rootState)).toEqual(state)
        })
      })
    })
  })

  // thunks
  describe('bulkUploadDataAction', () => {
    it('should call proper actions on success', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('file', '')
      const data = {}

      const responsePayload = { data, status: 200 }

      apiService.post = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(
        bulkUploadDataAction('id', { file: formData, fileName: 'text.txt' }),
      )

      // Assert
      const expectedActions = [
        bulkUpload(),
        bulkUploadSuccess({ data: responsePayload.data, fileName: 'text.txt' }),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })

    it('should call proper actions on fail', async () => {
      // Arrange
      const formData = new FormData()
      const errorMessage = 'Some error'
      const responsePayload = {
        response: {
          status: 500,
          data: { message: errorMessage },
        },
      }

      apiService.post = jest.fn().mockRejectedValueOnce(responsePayload)

      // Act
      await store.dispatch<any>(
        bulkUploadDataAction('id', { file: formData, fileName: 'text.txt' }),
      )

      // Assert
      const expectedActions = [
        bulkUpload(),
        addErrorNotification(responsePayload as AxiosError),
        bulkUploadFailed(errorMessage),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })
  })

  // thunks
  describe('bulkImportDefaultDataAction', () => {
    it('should call proper actions on success', async () => {
      const data = {}
      const responsePayload = { data, status: 200 }

      apiService.post = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(bulkImportDefaultDataAction('id'))

      // Assert
      const expectedActions = [
        bulkImportDefaultData(),
        bulkImportDefaultDataSuccess(),
        addMessageNotification(
          successMessages.UPLOAD_DATA_BULK(data as IBulkActionOverview),
        ),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })

    it('should call proper actions on fail', async () => {
      // Arrange
      const errorMessage = 'Some error'
      const responsePayload = {
        response: {
          status: 500,
          data: { message: errorMessage },
        },
      }

      apiService.post = jest.fn().mockRejectedValueOnce(responsePayload)

      // Act
      await store.dispatch<any>(bulkImportDefaultDataAction('id'))

      // Assert
      const expectedActions = [
        bulkImportDefaultData(),
        addErrorNotification(responsePayload as AxiosError),
        bulkImportDefaultDataFailed(),
      ]
      expect(store.getActions()).toEqual(expectedActions)
    })
  })
})
