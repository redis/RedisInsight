import type { ReduxStore } from 'uiSrc/slices/store'

// Re-export all types and exports from the real store to avoid circular dependencies during tests

export type { RootState, AppDispatch, ReduxStore } from 'uiSrc/slices/store'

// Lazy reference to avoid circular dependencies
// The store will be set by the store module itself after it's created
let storeRef: ReduxStore | null = null

// This function will be called by the store modules to set the reference
export const setStoreRef = (store: ReduxStore) => {
  storeRef = store
}

const getState: ReduxStore['getState'] = () => {
  if (!storeRef) {
    throw new Error(
      'Store not initialized. Make sure store-dynamic is imported after store creation.',
    )
  }
  return storeRef.getState()
}

export const dispatch: ReduxStore['dispatch'] = (action: any) => {
  if (!storeRef) {
    throw new Error(
      'Store not initialized. Make sure store-dynamic is imported after store creation.',
    )
  }
  return storeRef.dispatch(action)
}

const subscribe: ReduxStore['subscribe'] = (listener: () => void) => {
  if (!storeRef) {
    throw new Error(
      'Store not initialized. Make sure store-dynamic is imported after store creation.',
    )
  }
  return storeRef.subscribe(listener)
}

// Export store object that matches the real store interface
export const store = {
  getState,
  dispatch,
  subscribe,
}
