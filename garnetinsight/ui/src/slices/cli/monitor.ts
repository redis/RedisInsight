import { createSlice } from '@reduxjs/toolkit'
import { MonitorEvent } from 'uiSrc/constants'

import { IMonitorDataPayload, StateMonitor } from '../interfaces'
import { RootState } from '../store'

export const initialState: StateMonitor = {
  loading: false,
  loadingPause: false,
  isShowMonitor: false,
  isRunning: false,
  isStarted: false,
  isPaused: false,
  isResumeLocked: false,
  isSaveToFile: false,
  isMinimizedMonitor: false,
  socket: null,
  error: '',
  items: [],
  logFileId: null,
  timestamp: {
    start: 0,
    paused: 0,
    unPaused: 0,
    duration: 0,
  },
}

export const MONITOR_ITEMS_MAX_COUNT = 10_000

// A slice for recipes
const monitorSlice = createSlice({
  name: 'monitor',
  initialState,
  reducers: {
    setMonitorInitialState: (state) => {
      state.socket?.emit(MonitorEvent.FlushLogs)
      state.socket?.removeAllListeners()
      state.socket?.disconnect()
      return { ...initialState }
    },
    // collapse / uncollapse Monitor
    toggleMonitor: (state) => {
      state.isShowMonitor = !state.isShowMonitor
      state.isMinimizedMonitor = !state.isMinimizedMonitor
    },

    // uncollapse Monitor
    showMonitor: (state) => {
      state.isShowMonitor = true
    },

    // hide / unhide CLI Helper
    toggleHideMonitor: (state) => {
      state.isMinimizedMonitor = !state.isMinimizedMonitor
    },

    setSocket: (state, { payload }) => {
      state.socket = payload
      state.isStarted = true
    },

    startMonitor: (state, { payload }) => {
      state.isRunning = true
      state.error = ''
      state.isSaveToFile = payload
    },

    setLogFileId: (state, { payload }) => {
      state.logFileId = payload
    },

    setStartTimestamp: (state, { payload }) => {
      state.timestamp.start = payload
      state.timestamp.unPaused = state.timestamp.start
    },

    togglePauseMonitor: (state) => {
      state.isPaused = !state.isPaused
      if (!state.isPaused) {
        state.timestamp.unPaused = Date.now()
      }
      if (state.isPaused) {
        state.timestamp.paused = Date.now()
        state.timestamp.duration +=
          state.timestamp.paused - state.timestamp.unPaused
      }
    },

    pauseMonitor: (state) => {
      state.isPaused = true
      state.timestamp.paused = Date.now()
      state.timestamp.duration +=
        state.timestamp.paused - state.timestamp.unPaused
    },

    setMonitorLoadingPause: (state, { payload }) => {
      state.loadingPause = payload
    },

    stopMonitor: (state) => {
      state.isRunning = false
    },

    resetProfiler: (state) => {
      state.socket?.emit(MonitorEvent.FlushLogs)
      state.socket?.removeAllListeners()
      state.socket?.disconnect()
      return {
        ...initialState,
        isShowMonitor: state.isShowMonitor,
        isMinimizedMonitor: state.isMinimizedMonitor,
      }
    },

    concatMonitorItems: (
      state,
      { payload }: { payload: IMonitorDataPayload[] },
    ) => {
      // small optimization to not unnecessary concat big arrays since we know max logs to show limitations
      if (payload.length >= MONITOR_ITEMS_MAX_COUNT) {
        state.items = payload.slice(-MONITOR_ITEMS_MAX_COUNT)
        return
      }

      if (state.items.length + payload.length >= MONITOR_ITEMS_MAX_COUNT) {
        // concat is faster for arrays
        state.items = state.items
          .slice(payload.length - MONITOR_ITEMS_MAX_COUNT)
          .concat(payload)
        return
      }

      state.items = state.items.concat(payload)
    },

    resetMonitorItems: (state) => {
      state.items = []
    },
    setError: (state, { payload }) => {
      state.error = payload
    },

    lockResume: (state) => {
      state.isResumeLocked = true
      state.isPaused = true
    },
  },
})

// Actions generated from the slice
export const {
  setMonitorInitialState,
  showMonitor,
  toggleMonitor,
  toggleHideMonitor,
  setSocket,
  togglePauseMonitor,
  pauseMonitor,
  lockResume,
  startMonitor,
  setStartTimestamp,
  setLogFileId,
  setMonitorLoadingPause,
  stopMonitor,
  resetProfiler,
  concatMonitorItems,
  resetMonitorItems,
  setError,
} = monitorSlice.actions

// A selector
export const monitorSelector = (state: RootState) => state.cli.monitor

// The reducer
export default monitorSlice.reducer
