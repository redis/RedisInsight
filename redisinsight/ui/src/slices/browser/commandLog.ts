import { createSlice } from '@reduxjs/toolkit'
import { CommandLogEvent } from 'uiSrc/constants'

import { ICommandLogEntry, StateCommandLog } from '../interfaces'
import { RootState } from '../store'

/** Max entries kept in memory. Older ones are dropped, newest kept. */
export const COMMAND_LOG_MAX_COUNT = 1000

export const initialState: StateCommandLog = {
  isEnabled: false,
  isPaused: false,
  isAutoScrollEnabled: true,
  socket: null,
  entries: [],
  error: '',
}

const commandLogSlice = createSlice({
  name: 'commandLog',
  initialState,
  reducers: {
    setCommandLogSocket: (state, { payload }) => {
      state.socket = payload
    },

    enableCommandLog: (state) => {
      state.isEnabled = true
      state.error = ''
    },

    disableCommandLog: (state) => {
      state.isEnabled = false
      state.isPaused = false
    },

    togglePauseCommandLog: (state) => {
      state.isPaused = !state.isPaused
    },

    setCommandLogAutoScroll: (state, { payload }: { payload: boolean }) => {
      state.isAutoScrollEnabled = payload
    },

    concatCommandLogEntries: (
      state,
      { payload }: { payload: ICommandLogEntry[] },
    ) => {
      // small optimization to avoid concatenating big arrays when we already
      // know the maximum number of entries we keep
      if (payload.length >= COMMAND_LOG_MAX_COUNT) {
        state.entries = payload.slice(-COMMAND_LOG_MAX_COUNT)
        return
      }

      if (state.entries.length + payload.length >= COMMAND_LOG_MAX_COUNT) {
        state.entries = state.entries
          .slice(payload.length - COMMAND_LOG_MAX_COUNT)
          .concat(payload)
        return
      }

      state.entries = state.entries.concat(payload)
    },

    resetCommandLogEntries: (state) => {
      state.entries = []
    },

    setCommandLogError: (state, { payload }) => {
      state.error = payload
    },

    resetCommandLog: (state) => {
      state.socket?.emit(CommandLogEvent.Unsubscribe)
      state.socket?.removeAllListeners()
      state.socket?.disconnect()

      return {
        ...initialState,
        isEnabled: state.isEnabled,
      }
    },
  },
})

export const {
  setCommandLogSocket,
  enableCommandLog,
  disableCommandLog,
  togglePauseCommandLog,
  setCommandLogAutoScroll,
  concatCommandLogEntries,
  resetCommandLogEntries,
  setCommandLogError,
  resetCommandLog,
} = commandLogSlice.actions

export const commandLogSelector = (state: RootState) => state.browser.commandLog

export default commandLogSlice.reducer
