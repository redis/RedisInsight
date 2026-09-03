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
  setSelectedRecord,
  updateLongTermMemorySuccess,
  setLongTermMemorySearch,
  toggleTopicFilter,
  toggleSessionFilter,
  toggleMemoryTypeFilter,
  toggleUserFilter,
  toggleNamespaceFilter,
  clearLtmFilters,
} from 'uiSrc/slices/agentMemory/workspace'
import {
  LongTermMemoryRecord,
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
    },
  ],
  summary: { text: 'a summary' },
}

const mockMemory: LongTermMemoryRecord = {
  id: 'memory-1',
  text: 'user likes redis',
  memoryType: 'semantic',
  topics: ['databases'],
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
    it('should store the search text', () => {
      const state = reducer(initialState, setLongTermMemorySearch('redis'))

      expect(state.longTermMemory.search).toEqual('redis')
    })

    it('should toggle every filter kind and clear them together', () => {
      let state = reducer(initialState, toggleTopicFilter('databases'))
      expect(state.longTermMemory.topics).toEqual(['databases'])

      state = reducer(state, toggleTopicFilter('databases'))
      expect(state.longTermMemory.topics).toEqual([])

      state = reducer(state, toggleTopicFilter('databases'))
      state = reducer(state, toggleSessionFilter('s-1'))
      state = reducer(state, toggleMemoryTypeFilter('episodic'))
      state = reducer(state, toggleUserFilter('u-1'))
      state = reducer(state, toggleNamespaceFilter('demo'))
      state = reducer(state, setLongTermMemorySearch('query'))
      expect(state.longTermMemory.topics).toEqual(['databases'])
      expect(state.longTermMemory.sessionIds).toEqual(['s-1'])
      expect(state.longTermMemory.memoryTypes).toEqual(['episodic'])
      expect(state.longTermMemory.userIds).toEqual(['u-1'])
      expect(state.longTermMemory.namespaces).toEqual(['demo'])

      state = reducer(state, clearLtmFilters())
      expect(state.longTermMemory.topics).toEqual([])
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

  describe('record selection + update', () => {
    it('should set and clear the selected record id', () => {
      let state = reducer(initialState, setSelectedRecord('memory-1'))
      expect(state.longTermMemory.selectedRecordId).toEqual('memory-1')

      state = reducer(state, setSelectedRecord(null))
      expect(state.longTermMemory.selectedRecordId).toBeNull()
    })

    it('should replace the updated record in place', () => {
      const state = reducer(
        initialState,
        getLongTermMemorySuccess([mockMemory]),
      )
      const updated = { ...mockMemory, text: 'user loves redis' }

      const nextState = reducer(state, updateLongTermMemorySuccess(updated))

      expect(nextState.longTermMemory.data).toEqual([updated])
    })

    it('should drop a selection that is no longer in the fetched data', () => {
      let state = reducer(initialState, getLongTermMemorySuccess([mockMemory]))
      state = reducer(state, setSelectedRecord('memory-1'))

      const nextState = reducer(state, getLongTermMemorySuccess([]))

      expect(nextState.longTermMemory.selectedRecordId).toBeNull()
    })
  })

  describe('resetWorkspace', () => {
    it('should reset the whole workspace state', () => {
      let state = reducer(initialState, setUserId('u1'))
      state = reducer(state, getLongTermMemorySuccess([mockMemory]))

      const nextState = reducer(state, resetWorkspace())

      expect(nextState).toEqual(initialState)
    })
  })
})
