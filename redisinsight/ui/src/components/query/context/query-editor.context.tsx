import React, { createContext, useContext, useRef } from 'react'

import { Nullable } from 'uiSrc/utils'
import { IEditorMount } from 'uiSrc/pages/workbench/interfaces'

import {
  QueryEditorContextValue,
  QueryEditorContextProviderProps,
} from './query-editor.context.types'

const defaultContextValue: QueryEditorContextValue = {
  monacoObjects: { current: null },
  query: '',
  setQuery: () => {},
  isLoading: false,
  commands: [],
  indexes: [],
  onSubmit: () => {},
}

const QueryEditorContext =
  createContext<QueryEditorContextValue>(defaultContextValue)

export const QueryEditorContextProvider: React.FC<
  QueryEditorContextProviderProps
> = ({ children, value }) => {
  const monacoObjects = useRef<Nullable<IEditorMount>>(null)

  return (
    <QueryEditorContext.Provider value={{ ...value, monacoObjects }}>
      {children}
    </QueryEditorContext.Provider>
  )
}

export const useQueryEditorContext = (): QueryEditorContextValue =>
  useContext(QueryEditorContext)
