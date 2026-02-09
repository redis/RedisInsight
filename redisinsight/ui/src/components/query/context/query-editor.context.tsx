import React, { createContext, ReactNode, useContext, useRef } from 'react'
import { monaco as monacoEditor } from 'react-monaco-editor'

import { IRedisCommand } from 'uiSrc/constants'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'
import { IEditorMount } from 'uiSrc/pages/workbench/interfaces'

export interface QueryEditorContextValue {
  // Editor instance
  monacoObjects: React.RefObject<Nullable<IEditorMount>>

  // State
  query: string
  setQuery: (value: string) => void
  isLoading: boolean

  // Data
  commands: IRedisCommand[]
  indexes: RedisResponseBuffer[]

  // Callbacks
  onSubmit: (value?: string) => void
}

const defaultContextValue: QueryEditorContextValue = {
  monacoObjects: { current: null },
  query: '',
  setQuery: () => {},
  isLoading: false,
  commands: [],
  indexes: [],
  onSubmit: () => {},
}

const QueryEditorContext = createContext<QueryEditorContextValue>(defaultContextValue)

export interface QueryEditorContextProviderProps {
  children: ReactNode
  value: Omit<QueryEditorContextValue, 'monacoObjects'>
}

export const QueryEditorContextProvider: React.FC<QueryEditorContextProviderProps> = ({
  children,
  value,
}) => {
  const monacoObjects = useRef<Nullable<IEditorMount>>(null)

  return (
    <QueryEditorContext.Provider value={{ ...value, monacoObjects }}>
      {children}
    </QueryEditorContext.Provider>
  )
}

export const useQueryEditorContext = (): QueryEditorContextValue =>
  useContext(QueryEditorContext)
