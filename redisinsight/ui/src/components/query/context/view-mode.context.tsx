import React, { createContext, ReactNode, useContext, useState } from 'react'

export enum ViewMode {
  Workbench = 'workbench',
  VectorSearch = 'vector-search',
}

interface ViewModeContextType {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
}

// Create the context
const ViewModeContext = createContext<ViewModeContextType | undefined>(
  undefined,
)

// Props for the provider
interface ViewModeContextProviderProps {
  children: ReactNode
  initialViewMode?: ViewMode // Optional prop to set the initial view mode
}

// Provider component
export const ViewModeContextProvider: React.FC<
  ViewModeContextProviderProps
> = ({
  children,
  initialViewMode = ViewMode.Workbench, // Default to Workbench if not provided
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode)

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode }}>
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
