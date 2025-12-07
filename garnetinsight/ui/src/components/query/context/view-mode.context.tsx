import React, { createContext, ReactNode, useContext } from 'react'

export enum ViewMode {
  Workbench = 'workbench',
  VectorSearch = 'vector-search',
}

interface ViewModeContextType {
  viewMode: ViewMode
}

const ViewModeContext = createContext<ViewModeContextType>({
  viewMode: ViewMode.Workbench,
})

// Props for the provider
interface ViewModeContextProviderProps {
  children: ReactNode
  viewMode?: ViewMode
}

export const ViewModeContextProvider: React.FC<
  ViewModeContextProviderProps
> = ({ children, viewMode = ViewMode.Workbench }) => {
  return (
    <ViewModeContext.Provider value={{ viewMode }}>
      {children}
    </ViewModeContext.Provider>
  )
}

export const useViewModeContext = (): ViewModeContextType =>
  useContext(ViewModeContext)
