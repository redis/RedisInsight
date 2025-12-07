import { AxiosError } from 'axios'
import { cloneDeep, set } from 'lodash'
import { MOCK_RECOMMENDATIONS } from 'uiSrc/constants/mocks/mock-recommendations'
import { Vote } from 'uiSrc/constants/recommendations'
import { apiService, resourcesService } from 'uiSrc/services'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import reducer, {
  initialState,
  getRecommendations,
  getRecommendationsSuccess,
  getRecommendationsFailure,
  setIsHighlighted,
  readRecommendations,
  fetchRecommendationsAction,
  readRecommendationsAction,
  recommendationsSelector,
  updateRecommendationSuccess,
  updateRecommendationError,
  updateLiveRecommendation,
  updateRecommendation,
  setTotalUnread,
  deleteLiveRecommendations,
  deleteRecommendations,
  getContentRecommendations,
  getContentRecommendationsSuccess,
  getContentRecommendationsFailure,
  fetchContentRecommendations,
  addUnreadRecommendations,
} from 'uiSrc/slices/recommendations/recommendations'
import {
  cleanup,
  initialStateDefault,
  mockStore,
  mockedStore,
} from 'uiSrc/utils/test-utils'

let store: typeof mockedStore

const mockId = 'id'
const mockName = 'name'
const mockVote = Vote.Like
const mockRecommendations = {
  recommendations: [
    { id: mockId, name: mockName, read: false, vote: null, hide: false },
  ],
  totalUnread: 1,
}
const mockRecommendationVoted = cloneDeep(mockRecommendations)
set(mockRecommendationVoted, 'recommendations[0].vote', mockVote)

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('recommendations slice', () => {
  describe('reducer, actions and selectors', () => {
    it('should return the initial state on first run', () => {
      // Arrange
      const nextState = initialState

      // Act
      const result = reducer(undefined, {})

      // Assert
      expect(result).toEqual(nextState)
    })

    describe('getRecommendations', () => {
      it('should properly set loading: true', () => {
        // Arrange
        const state = {
          ...initialState,
          loading: true,
          error: '',
        }

        // Act
        const nextState = reducer(initialState, getRecommendations())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          recommendations: nextState,
        })
        expect(recommendationsSelector(rootState)).toEqual(state)
      })
    })

    describe('getRecommendationsFailure', () => {
      it('should properly set error', () => {
        // Arrange
        const error = 'Some error'
        const state = {
          ...initialState,
          error,
          loading: false,
        }

        // Act
        const nextState = reducer(
          initialState,
          getRecommendationsFailure(error),
        )

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          recommendations: nextState,
        })
        expect(recommendationsSelector(rootState)).toEqual(state)
      })
    })

    describe('getRecommendationsSuccess', () => {
      it('should properly set loading: true', () => {
        const payload = mockRecommendations
        // Arrange
        const state = {
          ...initialState,
          loading: false,
          data: mockRecommendations,
        }

        // Act
        const nextState = reducer(
          initialState,
          getRecommendationsSuccess(payload),
        )

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          recommendations: nextState,
        })
        expect(recommendationsSelector(rootState)).toEqual(state)
      })
    })

    describe('setTotalUnread', () => {
      it('should properly set total unread', () => {
        // Arrange
        const data = 10
        const state = {
          ...initialState,
          isHighlighted: true,
          data: {
            ...initialState.data,
            totalUnread: data,
          },
        }

        // Act
        const nextState = reducer(initialState, setTotalUnread(data))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          recommendations: nextState,
        })
        expect(recommendationsSelector(rootState)).toEqual(state)
      })
    })

    describe('addUnreadRecommendations', () => {
      it('should properly set total unread', () => {
        // Arrange
        const currentState = {
          ...initialState,
          data: {
            ...initialState.data,
            recommendations: [{ id: '1' }, { id: '2' }],
            totalUnread: 1,
          },
        }

        const state = {
          ...currentState,
          isHighlighted: true,
          data: {
            ...initialState.data,
            recommendations: [{ id: '3' }, { id: '1' }, { id: '2' }],
            totalUnread: 2,
          },
        }

        // Act
        const nextState = reducer(
          currentState,
          addUnreadRecommendations({
            recommendations: [{ id: '3' }],
            totalUnread: 2,
          }),
        )

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          recommendations: nextState,
        })
        expect(recommendationsSelector(rootState)).toEqual(state)
      })
    })

    describe('readRecommendations', () => {
      it('should properly set totalUnread', () => {
        // Arrange
        const state = {
          ...initialState,
          data: { ...initialState.data, totalUnread: 0 },
          loading: false,
          error: '',
        }

        // Act
        const nextState = reducer(initialState, readRecommendations(0))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          recommendations: nextState,
        })
        expect(recommendationsSelector(rootState)).toEqual(state)
      })
    })

    describe('updateRecommendationSuccess', () => {
      it('should properly set data', () => {
        const payload = mockRecommendationVoted.recommendations[0]
        // Arrange
        const state = {
          ...initialState,
          loading: false,
          data: mockRecommendationVoted,
        }

        // Act
        const initialStateWithRecs = {
          ...initialState,
          data: mockRecommendations,
        }
        const nextState = reducer(
          initialStateWithRecs,
          updateRecommendationSuccess(payload),
        )

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          recommendations: nextState,
        })
        expect(recommendationsSelector(rootState)).toEqual(state)
      })
    })

    describe('updateRecommendationError', () => {
      it('should properly set an error', () => {
        const error = 'Some error'
        const state = {
          ...initialState,
          error,
          loading: false,
        }

        // Act
        const nextState = reducer(
          initialState,
          updateRecommendationError(error),
        )

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          recommendations: nextState,
        })
        expect(recommendationsSelector(rootState)).toEqual(state)
      })
    })
  })

  describe('deleteRecommendations', () => {
    it('should properly delete recommendations', () => {
      // Arrange
      const currentState = {
        ...initialState,
        data: {
          ...initialState.data,
          recommendations: [{ id: '1' }, { id: '2' }, { id: '3' }],
          totalUnread: 1,
        },
        loading: false,
        error: '',
      }

      const state = {
        ...initialState,
        data: {
          ...initialState.data,
          recommendations: [{ id: '1' }, { id: '3' }],
          totalUnread: 0,
        },
        loading: false,
        error: '',
      }

      // Act
      const nextState = reducer(
        currentState,
        deleteRecommendations([{ id: '2', isRead: false }]),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        recommendations: nextState,
      })
      expect(recommendationsSelector(rootState)).toEqual(state)
    })

    describe('getContentRecommendations', () => {
      it('should properly set loading: true', () => {
        // Arrange
        const state = {
          ...initialState,
          loading: true,
          error: '',
        }

        // Act
        const nextState = reducer(initialState, getContentRecommendations())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          recommendations: nextState,
        })
        expect(recommendationsSelector(rootState)).toEqual(state)
      })
    })

    describe('getContentRecommendationsFailure', () => {
      it('should properly set error', () => {
        // Arrange
        const error = 'Some error'
        const state = {
          ...initialState,
          loading: false,
        }

        // Act
        const nextState = reducer(
          initialState,
          getContentRecommendationsFailure(),
        )

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          recommendations: nextState,
        })
        expect(recommendationsSelector(rootState)).toEqual(state)
      })
    })

    describe('getContentRecommendationsSuccess', () => {
      it('should properly set loading: true', () => {
        const payload = MOCK_RECOMMENDATIONS
        // Arrange
        const state = {
          ...initialState,
          loading: false,
          content: MOCK_RECOMMENDATIONS,
        }

        // Act
        const nextState = reducer(
          initialState,
          getContentRecommendationsSuccess(payload),
        )

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          recommendations: nextState,
        })
        expect(recommendationsSelector(rootState)).toEqual(state)
      })
    })
  })

  // thunks
  describe('thunks', () => {
    describe('fetchRecommendationsAction', () => {
      it('succeed to fetch recommendations data', async () => {
        const data = {
          recommendations: [],
          totalUnread: 0,
        }
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchRecommendationsAction('instanceId'))

        // Assert
        const expectedActions = [
          getRecommendations(),
          getRecommendationsSuccess(data),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('succeed to fetch recommendations data and set highlighting', async () => {
        const data = mockRecommendations
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)
        const onSuccessActionMock = jest.fn()

        const state = {
          ...initialStateDefault.recommendations,
        }

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          recommendations: state,
        })

        const tempStore = mockStore(rootState)

        // Act
        await tempStore.dispatch<any>(
          fetchRecommendationsAction('instanceId', onSuccessActionMock),
        )

        // Assert
        const expectedActions = [
          getRecommendations(),
          setIsHighlighted(true),
          getRecommendationsSuccess(data),
        ]

        expect(tempStore.getActions()).toEqual(expectedActions)
        expect(onSuccessActionMock).toBeCalledWith(
          mockRecommendations.recommendations,
        )
        expect(onSuccessActionMock).toBeCalledTimes(1)
      })

      it('failed to fetch recommendations data', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchRecommendationsAction('instanceId'))

        // Assert
        const expectedActions = [
          getRecommendations(),
          addErrorNotification(responsePayload as AxiosError),
          getRecommendationsFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('readRecommendationsAction', () => {
      it('succeed to read recommendations', async () => {
        const data = {
          recommendations: [],
          totalUnread: 0,
        }
        const responsePayload = { data, status: 200 }

        apiService.patch = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(readRecommendationsAction('instanceId'))

        // Assert
        const expectedActions = [
          readRecommendations(data.totalUnread),
          setIsHighlighted(false),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to read recommendations', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.patch = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(readRecommendationsAction('instanceId'))

        expect(store.getActions()).toEqual([])
      })
    })

    describe('putLiveRecommendationVote', () => {
      it('succeed to update recommendation', async () => {
        // const data = mockRecommendations
        const data = mockRecommendationVoted.recommendations[0]
        const responsePayload = { data, status: 200 }

        apiService.patch = jest.fn().mockResolvedValue(responsePayload)
        const onSuccessActionMock = jest.fn()

        // Act
        await store.dispatch<any>(
          updateLiveRecommendation(
            mockId,
            { vote: mockVote },
            onSuccessActionMock,
          ),
        )

        // Assert
        const expectedActions = [
          updateRecommendation(),
          updateRecommendationSuccess(data),
        ]

        expect(store.getActions()).toEqual(expectedActions)
        expect(onSuccessActionMock).toBeCalledWith(data)
      })

      it('failed to put recommendation vote', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.patch = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          updateLiveRecommendation(mockId, mockVote, mockName),
        )

        // Assert
        const expectedActions = [
          updateRecommendation(),
          addErrorNotification(responsePayload as AxiosError),
          updateRecommendationError(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('deleteLiveRecommendations', () => {
      it('succeed to delete recommendation', async () => {
        const responsePayload = { status: 200 }

        apiService.delete = jest.fn().mockResolvedValue(responsePayload)
        const onSuccessActionMock = jest.fn()

        // Act
        await store.dispatch<any>(
          deleteLiveRecommendations([mockId], onSuccessActionMock),
        )

        // Assert
        expect(onSuccessActionMock).toBeCalledWith('')
        const expectedActions = [
          updateRecommendation(),
          deleteRecommendations([mockId]),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to delete recommendation', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.delete = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(deleteLiveRecommendations([mockId]))

        // Assert
        const expectedActions = [
          updateRecommendation(),
          addErrorNotification(responsePayload as AxiosError),
          updateRecommendationError(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchContentRecommendations', () => {
      it('succeed to get content recommendations', async () => {
        const data = MOCK_RECOMMENDATIONS
        const responsePayload = { status: 200, data }

        resourcesService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchContentRecommendations())

        // Assert
        const expectedActions = [
          getContentRecommendations(),
          getContentRecommendationsSuccess(data),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to get content recommendations', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        resourcesService.get = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchContentRecommendations())

        // Assert
        const expectedActions = [
          getContentRecommendations(),
          getContentRecommendationsFailure(),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
