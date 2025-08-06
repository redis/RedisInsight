import { createBrowserHistory } from 'history'

import type { RootState, AppDispatch, ReduxStore } from 'uiSrc/slices/store'

// Re-export all types and exports from the real store to avoid circular dependencies during tests

export type { RootState, AppDispatch, ReduxStore } from 'uiSrc/slices/store'
export const history = createBrowserHistory()

// Lazy reference to avoid circular dependencies
// The store will be set by the store module itself after it's created
let storeRef: ReduxStore | null = null

// This function will be called by the store modules to set the reference
export const setStoreRef = (store: ReduxStore) => {
  storeRef = store
}

const getState = (): RootState => {
  if (!storeRef) {
    throw new Error(
      'Store not initialized. Make sure store-dynamic is imported after store creation.',
    )
  }
  return storeRef.getState()
}

const dispatch: AppDispatch = (action: any) => {
  if (!storeRef) {
    throw new Error(
      'Store not initialized. Make sure store-dynamic is imported after store creation.',
    )
  }
  return storeRef.dispatch(action)
}

// Export store object that matches the real store interface
export const store = {
  getState,
  dispatch,
}
