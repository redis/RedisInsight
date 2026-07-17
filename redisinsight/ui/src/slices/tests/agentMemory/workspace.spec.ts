import reducer, {
  initialState,
  resetWorkspace,
  setWorkspaceEndpoint,
  loadFiltersSuccess,
  loadSessionsSuccess,
  setUserId,
  setSessionId,
  getWorkingMemorySuccess,
  getWorkingMemoryFailure,
  getLongTermMemorySuccess,
  setLongTermMemorySearch,
  setOptimizeQuery,
  toggleTopicFilter,
  toggleEntityFilter,
  toggleSessionFilter,
  toggleMemoryTypeFilter,
  toggleUserFilter,
  toggleNamespaceFilter,
  clearLtmFilters,
  getSummaries,
  getSummariesSuccess,
  getSummariesFailure,
  runSummaryViewStarted,
  runSummaryViewFinished,
} from 'uiSrc/slices/agentMemory/workspace'
import {
  LongTermMemoryRecord,
  SummaryView,
  WorkingMemory,
} from 'uiSrc/slices/interfaces/agentMemory'

const mockWorkingMemory: WorkingMemory = {
  sessionId: 'session-1',
  userId: 'user-1',
  messages: [
    {
      id: 'msg-1',
      role: 'user',
      content: 'hello',
      discreteMemoryExtracted: true,
    },
  ],
  summary: 'a summary',
}

const mockMemory: LongTermMemoryRecord = {
  id: 'memory-1',
  text: 'user likes redis',
  memoryType: 'semantic',
  topics: ['databases'],
  entities: ['redis'],
}

describe('agentMemory workspace slice', () => {
  describe('setWorkspaceEndpoint', () => {
    it('should bind the workspace to an endpoint and reset with the rest', () => {
      let state = reducer(initialState, setWorkspaceEndpoint('endpoint-1'))
      expect(state.endpointId).toEqual('endpoint-1')

      state = reducer(state, resetWorkspace())
      expect(state.endpointId).toBeNull()
    })
  })

  describe('loadFiltersSuccess', () => {
    it('should store discovered users and namespaces', () => {
      const nextState = reducer(
        initialState,
        loadFiltersSuccess({ users: ['u1', 'u2'], namespaces: ['ns1'] }),
      )

      expect(nextState.filters.users).toEqual(['u1', 'u2'])
      expect(nextState.filters.namespaces).toEqual(['ns1'])
    })
  })

  describe('loadSessionsSuccess', () => {
    it('should drop session filters pointing at removed sessions', () => {
      let state = reducer(initialState, toggleSessionFilter('s-1'))
      state = reducer(state, toggleSessionFilter('s-2'))

      const nextState = reducer(state, loadSessionsSuccess(['s-2', 's-3']))

      expect(nextState.filters.sessions).toEqual(['s-2', 's-3'])
      expect(nextState.longTermMemory.sessionIds).toEqual(['s-2'])
    })
  })

  describe('setSessionId', () => {
    it('should set the session and drop stale working memory', () => {
      const state = reducer(
        initialState,
        getWorkingMemorySuccess(mockWorkingMemory),
      )
      const nextState = reducer(state, setSessionId('session-2'))

      expect(nextState.filters.sessionId).toEqual('session-2')
      expect(nextState.workingMemory.data).toBeNull()
    })
  })

  describe('working memory', () => {
    it('should store the polled working memory', () => {
      const nextState = reducer(
        initialState,
        getWorkingMemorySuccess(mockWorkingMemory),
      )

      expect(nextState.workingMemory.data).toEqual(mockWorkingMemory)
      expect(nextState.workingMemory.error).toEqual('')
    })

    it('should store poll errors without dropping data', () => {
      const state = reducer(
        initialState,
        getWorkingMemorySuccess(mockWorkingMemory),
      )
      const nextState = reducer(state, getWorkingMemoryFailure('timeout'))

      expect(nextState.workingMemory.error).toEqual('timeout')
      expect(nextState.workingMemory.data).toEqual(mockWorkingMemory)
    })
  })

  describe('long-term memory controls', () => {
    it('should store search and optimizeQuery', () => {
      let state = reducer(initialState, setLongTermMemorySearch('redis'))
      state = reducer(state, setOptimizeQuery(true))

      expect(state.longTermMemory.search).toEqual('redis')
      expect(state.longTermMemory.optimizeQuery).toEqual(true)
    })

    it('should toggle every filter kind and clear them together', () => {
      let state = reducer(initialState, toggleTopicFilter('databases'))
      expect(state.longTermMemory.topics).toEqual(['databases'])

      state = reducer(state, toggleTopicFilter('databases'))
      expect(state.longTermMemory.topics).toEqual([])

      state = reducer(state, toggleEntityFilter('redis'))
      state = reducer(state, toggleTopicFilter('databases'))
      state = reducer(state, toggleSessionFilter('s-1'))
      state = reducer(state, toggleMemoryTypeFilter('episodic'))
      state = reducer(state, toggleUserFilter('u-1'))
      state = reducer(state, toggleNamespaceFilter('demo'))
      state = reducer(state, setLongTermMemorySearch('query'))
      expect(state.longTermMemory.sessionIds).toEqual(['s-1'])
      expect(state.longTermMemory.memoryTypes).toEqual(['episodic'])
      expect(state.longTermMemory.userIds).toEqual(['u-1'])
      expect(state.longTermMemory.namespaces).toEqual(['demo'])

      state = reducer(state, clearLtmFilters())
      expect(state.longTermMemory.topics).toEqual([])
      expect(state.longTermMemory.entities).toEqual([])
      expect(state.longTermMemory.sessionIds).toEqual([])
      expect(state.longTermMemory.memoryTypes).toEqual([])
      expect(state.longTermMemory.userIds).toEqual([])
      expect(state.longTermMemory.namespaces).toEqual([])
      expect(state.longTermMemory.search).toEqual('')
    })

    it('should store fetched memories', () => {
      const nextState = reducer(
        initialState,
        getLongTermMemorySuccess([mockMemory]),
      )

      expect(nextState.longTermMemory.data).toEqual([mockMemory])
    })
  })

  describe('summaries', () => {
    const mockViews: SummaryView[] = [
      { id: 'v-1', name: 'redisinsight:user-profile', groupBy: ['user_id'] },
      {
        id: 'v-2',
        name: 'redisinsight:session-profile',
        groupBy: ['session_id'],
        continuous: true,
      },
    ]
    const mockPartitions = {
      'v-1': [{ summary: 'user profile', group: { user_id: 'u-1' } }],
      'v-2': [{ summary: 'session profile', group: { session_id: 's-1' } }],
    }

    it('should set loading while fetching and clear it on failure', () => {
      let state = reducer(initialState, getSummaries())
      expect(state.summary.loading).toEqual(true)

      state = reducer(state, getSummariesFailure())
      expect(state.summary.loading).toEqual(false)
    })

    it('should store the views with their partitions', () => {
      const state = reducer(initialState, getSummaries())
      const nextState = reducer(
        state,
        getSummariesSuccess({ views: mockViews, partitions: mockPartitions }),
      )

      expect(nextState.summary.loading).toEqual(false)
      expect(nextState.summary.views).toEqual(mockViews)
      expect(nextState.summary.partitions).toEqual(mockPartitions)
    })

    it('should stamp lastRefreshTime when summaries land', () => {
      const now = 1752600000000
      const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(now)

      const nextState = reducer(
        initialState,
        getSummariesSuccess({ views: mockViews, partitions: mockPartitions }),
      )

      expect(nextState.summary.lastRefreshTime).toEqual(now)

      dateNowSpy.mockRestore()
    })

    it('should track running views while a full view recompute is in flight', () => {
      let state = reducer(initialState, runSummaryViewStarted('v-1'))
      expect(state.summary.runningViewIds).toEqual(['v-1'])

      state = reducer(state, runSummaryViewStarted('v-2'))
      expect(state.summary.runningViewIds).toEqual(['v-1', 'v-2'])

      state = reducer(state, runSummaryViewFinished('v-1'))
      expect(state.summary.runningViewIds).toEqual(['v-2'])

      state = reducer(state, runSummaryViewFinished('v-2'))
      expect(state.summary.runningViewIds).toEqual([])
    })

    it('should not duplicate a running view id when its run starts again', () => {
      let state = reducer(initialState, runSummaryViewStarted('v-1'))
      state = reducer(state, runSummaryViewStarted('v-1'))

      expect(state.summary.runningViewIds).toEqual(['v-1'])
    })

    it('should store a null view list for backends without summary views', () => {
      const nextState = reducer(
        initialState,
        getSummariesSuccess({ views: null, partitions: {} }),
      )

      expect(nextState.summary.views).toBeNull()
      expect(nextState.summary.partitions).toEqual({})
    })
  })

  describe('resetWorkspace', () => {
    it('should reset the whole workspace state', () => {
      let state = reducer(initialState, setUserId('u1'))
      state = reducer(state, getLongTermMemorySuccess([mockMemory]))
      state = reducer(
        state,
        getSummariesSuccess({
          views: [{ id: 'v1', name: 'view', groupBy: ['user_id'] }],
          partitions: {},
        }),
      )

      const nextState = reducer(state, resetWorkspace())

      expect(nextState).toEqual(initialState)
    })
  })
})
