import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { Nullable } from 'uiSrc/utils'

import { RootState } from '../store'
import {
  AgentMemoryConfiguration,
  LongTermMemoryRecord,
  StateAgentMemoryWorkspace,
  SummaryView,
  SummaryViewPartition,
  WorkingMemory,
} from '../interfaces/agentMemory'

export const initialState: StateAgentMemoryWorkspace = {
  endpointId: null,
  filters: {
    loading: false,
    users: [],
    namespaces: [],
    sessions: [],
    userId: null,
    namespace: null,
    sessionId: null,
  },
  workingMemory: {
    loading: false,
    error: '',
    data: null,
    lastRefreshTime: null,
  },
  longTermMemory: {
    loading: false,
    error: '',
    data: [],
    lastRefreshTime: null,
    search: '',
    optimizeQuery: false,
    topics: [],
    entities: [],
    sessionIds: [],
    memoryTypes: [],
    userIds: [],
    namespaces: [],
  },
  summary: {
    loading: false,
    views: null,
    partitions: {},
    runningViewIds: [],
    lastRefreshTime: null,
  },
  configuration: {
    loading: false,
    data: null,
  },
}

const toggleItem = (list: string[], item: string): string[] =>
  list.includes(item) ? list.filter((i) => i !== item) : [...list, item]

const inspectorSlice = createSlice({
  name: 'agentMemoryWorkspace',
  initialState,
  reducers: {
    resetWorkspace: () => initialState,
    setWorkspaceEndpoint: (
      state,
      { payload }: PayloadAction<Nullable<string>>,
    ) => {
      state.endpointId = payload
    },

    // discovery + scope filters
    loadFilters: (state) => {
      state.filters.loading = true
    },
    loadFiltersSuccess: (
      state,
      { payload }: PayloadAction<{ users: string[]; namespaces: string[] }>,
    ) => {
      state.filters.loading = false
      state.filters.users = payload.users
      state.filters.namespaces = payload.namespaces
    },
    loadFiltersFailure: (state) => {
      state.filters.loading = false
    },
    loadSessionsSuccess: (state, { payload }: PayloadAction<string[]>) => {
      state.filters.sessions = payload
      // Filter selections pointing at sessions that no longer exist would
      // silently pin the records view to nothing.
      state.longTermMemory.sessionIds = state.longTermMemory.sessionIds.filter(
        (id) => payload.includes(id),
      )
    },
    setUserId: (state, { payload }: PayloadAction<Nullable<string>>) => {
      state.filters.userId = payload
    },
    setNamespace: (state, { payload }: PayloadAction<Nullable<string>>) => {
      state.filters.namespace = payload
    },
    setSessionId: (state, { payload }: PayloadAction<Nullable<string>>) => {
      state.filters.sessionId = payload
      state.workingMemory.data = null
    },

    // working memory
    getWorkingMemory: (state) => {
      state.workingMemory.loading = true
    },
    getWorkingMemorySuccess: (
      state,
      { payload }: PayloadAction<WorkingMemory>,
    ) => {
      state.workingMemory.loading = false
      state.workingMemory.error = ''
      state.workingMemory.data = payload
      state.workingMemory.lastRefreshTime = Date.now()
    },
    getWorkingMemoryFailure: (state, { payload }: PayloadAction<string>) => {
      state.workingMemory.loading = false
      state.workingMemory.error = payload
    },
    clearWorkingMemorySuccess: (state) => {
      state.workingMemory.data = null
    },

    // long-term memory
    getLongTermMemory: (state) => {
      state.longTermMemory.loading = true
    },
    getLongTermMemorySuccess: (
      state,
      { payload }: PayloadAction<LongTermMemoryRecord[]>,
    ) => {
      state.longTermMemory.loading = false
      state.longTermMemory.error = ''
      state.longTermMemory.data = payload
      state.longTermMemory.lastRefreshTime = Date.now()
    },
    getLongTermMemoryFailure: (state, { payload }: PayloadAction<string>) => {
      state.longTermMemory.loading = false
      state.longTermMemory.error = payload
    },
    setLongTermMemorySearch: (state, { payload }: PayloadAction<string>) => {
      state.longTermMemory.search = payload
    },
    setOptimizeQuery: (state, { payload }: PayloadAction<boolean>) => {
      state.longTermMemory.optimizeQuery = payload
    },
    toggleTopicFilter: (state, { payload }: PayloadAction<string>) => {
      state.longTermMemory.topics = toggleItem(
        state.longTermMemory.topics,
        payload,
      )
    },
    toggleEntityFilter: (state, { payload }: PayloadAction<string>) => {
      state.longTermMemory.entities = toggleItem(
        state.longTermMemory.entities,
        payload,
      )
    },
    toggleSessionFilter: (state, { payload }: PayloadAction<string>) => {
      state.longTermMemory.sessionIds = toggleItem(
        state.longTermMemory.sessionIds,
        payload,
      )
    },
    toggleMemoryTypeFilter: (state, { payload }: PayloadAction<string>) => {
      state.longTermMemory.memoryTypes = toggleItem(
        state.longTermMemory.memoryTypes,
        payload,
      )
    },
    toggleUserFilter: (state, { payload }: PayloadAction<string>) => {
      state.longTermMemory.userIds = toggleItem(
        state.longTermMemory.userIds,
        payload,
      )
    },
    toggleNamespaceFilter: (state, { payload }: PayloadAction<string>) => {
      state.longTermMemory.namespaces = toggleItem(
        state.longTermMemory.namespaces,
        payload,
      )
    },
    clearLtmFilters: (state) => {
      state.longTermMemory.search = ''
      state.longTermMemory.topics = []
      state.longTermMemory.entities = []
      state.longTermMemory.sessionIds = []
      state.longTermMemory.memoryTypes = []
      state.longTermMemory.userIds = []
      state.longTermMemory.namespaces = []
    },

    // summary views
    getSummaries: (state) => {
      state.summary.loading = true
    },
    getSummariesSuccess: (
      state,
      {
        payload,
      }: PayloadAction<{
        views: Nullable<SummaryView[]>
        partitions: Record<string, SummaryViewPartition[]>
      }>,
    ) => {
      state.summary.loading = false
      state.summary.views = payload.views
      state.summary.partitions = payload.partitions
      state.summary.lastRefreshTime = Date.now()
    },
    getSummariesFailure: (state) => {
      state.summary.loading = false
    },
    runSummaryViewStarted: (state, { payload }: PayloadAction<string>) => {
      state.summary.runningViewIds = [
        ...state.summary.runningViewIds.filter((id) => id !== payload),
        payload,
      ]
    },
    runSummaryViewFinished: (state, { payload }: PayloadAction<string>) => {
      state.summary.runningViewIds = state.summary.runningViewIds.filter(
        (id) => id !== payload,
      )
    },

    // store configuration
    getConfiguration: (state) => {
      state.configuration.loading = true
    },
    getConfigurationSuccess: (
      state,
      { payload }: PayloadAction<AgentMemoryConfiguration>,
    ) => {
      state.configuration.loading = false
      state.configuration.data = payload
    },
    getConfigurationFailure: (state) => {
      state.configuration.loading = false
    },
  },
})

export const {
  resetWorkspace,
  setWorkspaceEndpoint,
  loadFilters,
  loadFiltersSuccess,
  loadFiltersFailure,
  loadSessionsSuccess,
  setUserId,
  setNamespace,
  setSessionId,
  getWorkingMemory,
  getWorkingMemorySuccess,
  getWorkingMemoryFailure,
  clearWorkingMemorySuccess,
  getLongTermMemory,
  getLongTermMemorySuccess,
  getLongTermMemoryFailure,
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
  getConfiguration,
  getConfigurationSuccess,
  getConfigurationFailure,
} = inspectorSlice.actions

// selectors
export const agentMemoryFiltersSelector = (state: RootState) =>
  state.agentMemory.workspace.filters
export const agentMemoryWorkingSelector = (state: RootState) =>
  state.agentMemory.workspace.workingMemory
export const agentMemoryLongTermSelector = (state: RootState) =>
  state.agentMemory.workspace.longTermMemory
export const agentMemorySummarySelector = (state: RootState) =>
  state.agentMemory.workspace.summary
export const agentMemoryConfigurationSelector = (state: RootState) =>
  state.agentMemory.workspace.configuration

export default inspectorSlice.reducer

// Thunks live in ./thunks/* by domain; re-exported here so consumers keep
// a single import surface for the workspace slice.
export { discoverFiltersAction, changeScopeAction } from './thunks/scope'
export {
  fetchWorkingMemoryAction,
  clearWorkingMemoryAction,
  addSessionEventAction,
} from './thunks/working-memory'
export {
  fetchLongTermMemoryAction,
  deleteLongTermMemoryAction,
} from './thunks/long-term-memory'
export {
  fetchSummariesAction,
  createDefaultSummaryViewsAction,
  deleteSummaryViewAction,
  runSummaryViewAction,
  runSummaryPartitionAction,
} from './thunks/summary-views'
export { fetchConfigurationAction } from './thunks/configuration'
