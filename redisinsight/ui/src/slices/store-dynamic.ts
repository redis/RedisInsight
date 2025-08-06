import type { RootState, AppDispatch } from './store'

// Lazy reference to avoid circular dependencies
// The store will be set by the store module itself after it's created
let storeRef: { getState: () => RootState; dispatch: AppDispatch } | null = null

// This function will be called by the store modules to set the reference
export const setStoreRef = (store: { getState: () => RootState; dispatch: AppDispatch }) => {
  storeRef = store
}

const getState = (): RootState => {
  if (!storeRef) {
    throw new Error('Store not initialized. Make sure store-dynamic is imported after store creation.')
  }
  return storeRef.getState()
}

const dispatch: AppDispatch = (action: any) => {
  if (!storeRef) {
    throw new Error('Store not initialized. Make sure store-dynamic is imported after store creation.')
  }
  return storeRef.dispatch(action)
}

export const store = {
  getState,
  dispatch,
}

export type { RootState, AppDispatch }
