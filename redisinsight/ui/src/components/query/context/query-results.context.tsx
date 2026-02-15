import React, { createContext, ReactNode, useContext } from 'react'

export interface QueryResultsTelemetry {
  onCommandCopied?: (params: { command: string; databaseId: string }) => void
  onResultCleared?: (params: { command: string; databaseId: string }) => void
  onResultCollapsed?: (params: { command: string; databaseId: string }) => void
  onResultExpanded?: (params: { command: string; databaseId: string }) => void
  onResultViewChanged?: (params: Record<string, unknown>) => void
  onFullScreenToggled?: (params: { state: string; databaseId: string }) => void
  onQueryReRun?: (params: { command: string; databaseId: string }) => void
}

export interface QueryResultsContextValue {
  telemetry: QueryResultsTelemetry
}

const defaultContextValue: QueryResultsContextValue = {
  telemetry: {},
}

const QueryResultsContext =
  createContext<QueryResultsContextValue>(defaultContextValue)

interface QueryResultsProviderProps {
  children: ReactNode
  telemetry?: QueryResultsTelemetry
}

export const QueryResultsProvider: React.FC<QueryResultsProviderProps> = ({
  children,
  telemetry = {},
}) => (
  <QueryResultsContext.Provider value={{ telemetry }}>
    {children}
  </QueryResultsContext.Provider>
)

export const useQueryResultsContext = (): QueryResultsContextValue =>
  useContext(QueryResultsContext)
