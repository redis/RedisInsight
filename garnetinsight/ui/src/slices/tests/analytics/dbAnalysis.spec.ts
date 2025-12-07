import { AxiosError } from 'axios'
import { cloneDeep } from 'lodash'
import { apiService } from 'uiSrc/services'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import reducer, {
  initialState,
  setDatabaseAnalysisInitialState,
  getDBAnalysis,
  getDBAnalysisSuccess,
  getDBAnalysisError,
  loadDBAnalysisReports,
  loadDBAnalysisReportsSuccess,
  loadDBAnalysisReportsError,
  setSelectedAnalysisId,
  fetchDBAnalysisAction,
  createNewAnalysis,
  fetchDBAnalysisReportsHistory,
  dbAnalysisReportsSelector,
  dbAnalysisSelector,
  setShowNoExpiryGroup,
  setRecommendationVote,
  setRecommendationVoteSuccess,
  setRecommendationVoteError,
  putRecommendationVote,
} from 'uiSrc/slices/analytics/dbAnalysis'
import { Vote } from 'uiSrc/constants/recommendations'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'

let store: typeof mockedStore

const mockAnalysis = {
  id: '071ce08e-00b5-4356-b261-b666f4fbbbd9',
  databaseId: '528332fb-3fad-4392-a1e3-8eb919a76680',
  filter: { type: null, match: '*', count: 10000 },
  delimiter: ':',
  progress: { total: 14209, scanned: 80000, processed: 14209 },
  createdAt: new Date('2021-04-22T09:03:56.917Z'),
  totalKeys: {
    total: 14209,
    types: [{ type: 'zset', total: 1 }],
  },
  totalMemory: {
    total: 1026830,
    types: [{ type: 'zset', total: 96 }],
  },
  topKeysNsp: [
    {
      nsp: 'delimiter_4',
      memory: 1399,
      keys: 7,
      types: [{ type: 'zset', memory: 96, keys: 1 }],
    },
  ],
  topMemoryNsp: [
    {
      nsp: 'delimiter_3',
      memory: 114768,
      keys: 1,
      types: [{ type: 'string', memory: 114768, keys: 1 }],
    },
  ],
  topKeysMemory: [
    {
      name: 'delimiter_3:big',
      type: 'string',
      memory: 114768,
      length: 100331,
      ttl: -1,
    },
  ],
}

const mockHistoryReport = {
  id: 'id',
  created: new Date('2021-04-22T09:03:56.917Z'),
}

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('db analysis slice', () => {
  describe('reducer, actions and selectors', () => {
    it('should return the initial state on first run', () => {
      // Arrange
      const nextState = initialState

      // Act
      const result = reducer(undefined, {})

      // Assert
      expect(result).toEqual(nextState)
    })

    describe('setDatabaseAnalysisInitialState', () => {
      it('should properly set initial state', () => {
        const nextState = reducer(
          initialState,
          setDatabaseAnalysisInitialState(),
        )
        const rootState = Object.assign(initialStateDefault, {
          analytics: { databaseAnalysis: nextState },
        })
        expect(dbAnalysisSelector(rootState)).toEqual(initialState)
      })
    })

    describe('setSelectedAnalysisId', () => {
      it('should properly set payload to selectedAnalysis', () => {
        const payload = 'id'

        // Arrange
        const stateHistory = {
          ...initialState.history,
          selectedAnalysis: 'id',
        }

        // Act
        const nextState = reducer(initialState, setSelectedAnalysisId(payload))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          analytics: { databaseAnalysis: nextState },
        })
        expect(dbAnalysisReportsSelector(rootState)).toEqual(stateHistory)
      })
    })

    describe('loadDBAnalysisReportsError', () => {
      it('should properly set error to history', () => {
        // Arrange
        const error = 'Some error'
        const state = {
          ...initialState,
          history: {
            loading: false,
            error,
            data: [],
            selectedAnalysis: null,
            showNoExpiryGroup: false,
          },
        }

        // Act
        const nextState = reducer(
          initialState,
          loadDBAnalysisReportsError(error),
        )

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          analytics: { databaseAnalysis: nextState },
        })
        expect(dbAnalysisSelector(rootState)).toEqual(state)
      })
    })
    describe('getDBAnalysisError', () => {
      it('should properly set error', () => {
        // Arrange
        const error = 'Some error'
        const state = {
          ...initialState,
          error,
          loading: false,
        }

        // Act
        const nextState = reducer(initialState, getDBAnalysisError(error))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          analytics: { databaseAnalysis: nextState },
        })
        expect(dbAnalysisSelector(rootState)).toEqual(state)
      })
    })
    describe('setRecommendationVoteError', () => {
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
          setRecommendationVoteError(error),
        )

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          analytics: { databaseAnalysis: nextState },
        })
        expect(dbAnalysisSelector(rootState)).toEqual(state)
      })
    })
    describe('getDBAnalysis', () => {
      it('should properly set loading: true', () => {
        // Arrange
        const state = {
          ...initialState,
          loading: true,
        }

        // Act
        const nextState = reducer(initialState, getDBAnalysis())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          analytics: { databaseAnalysis: nextState },
        })
        expect(dbAnalysisSelector(rootState)).toEqual(state)
      })
    })
    describe('loadDBAnalysisReports', () => {
      it('should properly set loading: true', () => {
        // Arrange
        const state = {
          ...initialState,
          history: {
            ...initialState.history,
            loading: true,
          },
        }

        // Act
        const nextState = reducer(initialState, loadDBAnalysisReports())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          analytics: { databaseAnalysis: nextState },
        })
        expect(dbAnalysisSelector(rootState)).toEqual(state)
      })
    })
    describe('getDBAnalysisSuccess', () => {
      it('should properly set loading: true', () => {
        const payload = mockAnalysis
        // Arrange
        const state = {
          ...initialState,
          loading: false,
          data: mockAnalysis,
        }

        // Act
        const nextState = reducer(initialState, getDBAnalysisSuccess(payload))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          analytics: { databaseAnalysis: nextState },
        })
        expect(dbAnalysisSelector(rootState)).toEqual(state)
      })
    })
    describe('setRecommendationVoteSuccess', () => {
      it('should properly set data', () => {
        const payload = mockAnalysis
        // Arrange
        const state = {
          ...initialState,
          loading: false,
          data: mockAnalysis,
        }

        // Act
        const nextState = reducer(
          initialState,
          setRecommendationVoteSuccess(payload),
        )

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          analytics: { databaseAnalysis: nextState },
        })
        expect(dbAnalysisSelector(rootState)).toEqual(state)
      })
    })
    describe('loadDBAnalysisReportsSuccess', () => {
      it('should properly set data to history', () => {
        const payload = [mockHistoryReport]
        // Arrange
        const stateHistory = {
          ...initialState.history,
          loading: false,
          data: [{ id: 'id', created: new Date('2021-04-22T09:03:56.917Z') }],
        }

        // Act
        const nextState = reducer(
          initialState,
          loadDBAnalysisReportsSuccess(payload),
        )

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          analytics: { databaseAnalysis: nextState },
        })
        expect(dbAnalysisReportsSelector(rootState)).toEqual(stateHistory)
      })
    })
    describe('setShowNoExpiryGroup', () => {
      it('should properly set data to history', () => {
        const payload = true
        // Arrange
        const stateHistory = {
          ...initialState.history,
          showNoExpiryGroup: true,
        }

        // Act
        const nextState = reducer(initialState, setShowNoExpiryGroup(payload))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          analytics: { databaseAnalysis: nextState },
        })
        expect(dbAnalysisReportsSelector(rootState)).toEqual(stateHistory)
      })
    })
  })

  // thunks
  describe('thunks', () => {
    describe('fetchDBAnalysisAction', () => {
      it('succeed to fetch analysis data', async () => {
        const data = mockAnalysis
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchDBAnalysisAction('instanceId', 'id'))

        // Assert
        const expectedActions = [getDBAnalysis(), getDBAnalysisSuccess(data)]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch data', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchDBAnalysisAction('instanceId', 'id'))

        // Assert
        const expectedActions = [
          getDBAnalysis(),
          addErrorNotification(responsePayload as AxiosError),
          getDBAnalysisError(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })
    describe('createNewAnalysis', () => {
      it('succeed to create new analysis', async () => {
        const data = mockAnalysis
        const responsePayload = { data, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        const responsePayloadGet = {
          data: [{ id: data.id, createdAt: data.createdAt }, mockHistoryReport],
          status: 200,
        }

        apiService.get = jest.fn().mockResolvedValue(responsePayloadGet)

        // Act
        await store.dispatch<any>(
          createNewAnalysis('instanceId', ['delimiter']),
        )

        // Assert
        const expectedActions = [
          getDBAnalysis(),
          getDBAnalysisSuccess(data),
          loadDBAnalysisReports(),
          setSelectedAnalysisId(data.id),
          loadDBAnalysisReportsSuccess([
            {
              createdAt: mockAnalysis.createdAt,
              id: mockAnalysis.id,
            },
            mockHistoryReport,
          ]),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to create new analysis', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          createNewAnalysis('instanceId', ['delimiter']),
        )

        // Assert
        const expectedActions = [
          getDBAnalysis(),
          addErrorNotification(responsePayload as AxiosError),
          getDBAnalysisError(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })
    describe('fetchDBAnalysisReportsHistory', () => {
      it('succeed to fetch analysis reports', async () => {
        const data = [mockHistoryReport]
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchDBAnalysisReportsHistory('instanceId'))

        // Assert
        const expectedActions = [
          loadDBAnalysisReports(),
          loadDBAnalysisReportsSuccess(data),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to create new analysis', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchDBAnalysisReportsHistory('instanceId'))

        // Assert
        const expectedActions = [
          loadDBAnalysisReports(),
          addErrorNotification(responsePayload as AxiosError),
          loadDBAnalysisReportsError(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })
    describe('putRecommendationVote', () => {
      it('succeed to put recommendation vote', async () => {
        const data = mockAnalysis
        const responsePayload = { data, status: 200 }

        apiService.patch = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(putRecommendationVote('name', Vote.Like))

        // Assert
        const expectedActions = [
          setRecommendationVote(),
          setRecommendationVoteSuccess(data),
        ]

        expect(store.getActions()).toEqual(expectedActions)
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
        await store.dispatch<any>(putRecommendationVote('name', Vote.Like))

        // Assert
        const expectedActions = [
          setRecommendationVote(),
          addErrorNotification(responsePayload as AxiosError),
          setRecommendationVoteError(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
