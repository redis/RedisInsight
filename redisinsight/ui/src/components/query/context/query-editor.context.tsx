import React, { createContext, useCallback, useContext, useRef } from 'react'

import { expandVectorEmbeddings, Nullable } from 'uiSrc/utils'
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

export const QueryEditorContextProvider = ({
  children,
  value,
}: QueryEditorContextProviderProps) => {
  const monacoObjects = useRef<Nullable<IEditorMount>>(null)

  const { onSubmit, query } = value
  // The editor may show collapsed vector embedding placeholders instead of
  // the full values, so every submitted query is expanded back first.
  const handleSubmit = useCallback(
    (submittedQuery?: string) =>
      onSubmit(expandVectorEmbeddings(submittedQuery ?? query)),
    [onSubmit, query],
  )

  return (
    <QueryEditorContext.Provider
      value={{ ...value, monacoObjects, onSubmit: handleSubmit }}
    >
      {children}
    </QueryEditorContext.Provider>
  )
}

export const useQueryEditorContext = (): QueryEditorContextValue =>
  useContext(QueryEditorContext)
