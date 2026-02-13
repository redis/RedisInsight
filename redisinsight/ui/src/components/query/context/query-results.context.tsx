import React, { createContext, ReactNode, useContext } from 'react'

export enum QueryCardField {
  Profiler = 'profiler',
  ViewType = 'viewType',
}

export interface QueryResultsTelemetry {
  onCommandCopied?: (params: { command: string; databaseId: string }) => void
  onResultCleared?: (params: { command: string; databaseId: string }) => void
  onResultCollapsed?: (params: { command: string; databaseId: string }) => void
  onResultExpanded?: (params: { command: string; databaseId: string }) => void
  onResultViewChanged?: (params: Record<string, unknown>) => void
  onFullScreenToggled?: (params: { state: string; databaseId: string }) => void
}

export interface QueryResultsConfig {
  showFields?: QueryCardField[]
}

export interface QueryResultsContextValue {
  telemetry: QueryResultsTelemetry
  config: QueryResultsConfig
}

const defaultContextValue: QueryResultsContextValue = {
  telemetry: {},
  config: { showFields: [] },
}

const QueryResultsContext =
  createContext<QueryResultsContextValue>(defaultContextValue)

interface QueryResultsProviderProps {
  children: ReactNode
  telemetry?: QueryResultsTelemetry
  config?: QueryResultsConfig
}

export const QueryResultsProvider: React.FC<QueryResultsProviderProps> = ({
  children,
  telemetry = {},
  config = { showFields: [] },
}) => (
  <QueryResultsContext.Provider value={{ telemetry, config }}>
    {children}
  </QueryResultsContext.Provider>
)

export const useQueryResultsContext = (): QueryResultsContextValue =>
  useContext(QueryResultsContext)
