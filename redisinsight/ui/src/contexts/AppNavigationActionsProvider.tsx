import React, { createContext, useContext } from 'react'
import { Nullable } from 'uiSrc/utils'

interface AppNavigationActionsType {
  actions: Nullable<React.ReactNode>
  setActions: (actions: Nullable<React.ReactNode>) => void
}

// Create a context
const AppNavigationActionsContext = createContext<AppNavigationActionsType>({
  actions: null,
  setActions: () => {},
})

// Custom hook to access the header context
export const useAppNavigationActions = () =>
  useContext(AppNavigationActionsContext)
export const AppNavigationActionsProvider = AppNavigationActionsContext.Provider
