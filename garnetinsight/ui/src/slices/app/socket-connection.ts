import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { StateAppSocketConnection } from '../interfaces'

export const initialState: StateAppSocketConnection = {
  isConnected: false,
}

// A slice for recipes
const appSocketConnectionSlice = createSlice({
  name: 'appSocketConnection',
  initialState,
  reducers: {
    setAppSocketConnectionInitialState: () => initialState,
    setIsConnected: (state, { payload }) => {
      state.isConnected = payload
    },
  },
})

// Actions generated from the slice
export const { setAppSocketConnectionInitialState, setIsConnected } =
  appSocketConnectionSlice.actions

// Selectors
export const appSocketConnectionSelector = (state: RootState) =>
  state.app.socketConnection

// The reducer
export default appSocketConnectionSlice.reducer
