/* eslint-disable global-require */
import type { RootState, AppDispatch } from './store'

// Importing store methods dynamically to avoid circular dependencies

const getState = (): RootState => {
  const { store } = require('uiSrc/slices/store')
  return store.getState() as RootState
}

const dispatch: AppDispatch = (action: any) => {
  const { store } = require('uiSrc/slices/store')
  return store.dispatch(action)
}

const store = {
  getState,
  dispatch,
}

export { store }

export { RootState, AppDispatch }
