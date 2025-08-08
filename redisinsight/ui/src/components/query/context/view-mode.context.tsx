import React, { createContext, ReactNode, useContext, useState } from 'react'

export enum ViewMode {
  Workbench = 'workbench',
  VectorSearch = 'vector-search',
}

interface ViewModeContextType {
  viewMode: ViewMode
}

// Create the context
const ViewModeContext = createContext<ViewModeContextType | undefined>(
  undefined,
)

// Props for the provider
interface ViewModeContextProviderProps {
  children: ReactNode
  viewMode?: ViewMode // Optional prop to set the initial view mode
}

// Provider component
export const ViewModeContextProvider: React.FC<
  ViewModeContextProviderProps
> = ({ children, viewMode = ViewMode.Workbench }) => {
  return (
    <ViewModeContext.Provider value={{ viewMode }}>
      {children}
    </ViewModeContext.Provider>
  )
}

// Custom hook to use the ViewModeContext
export const useViewModeContext = (): ViewModeContextType => {
  const context = useContext(ViewModeContext)

  if (!context) {
    throw new Error(
      'useViewModeContext must be used within a ViewModeContextProvider',
    )
  }

  return context
}
