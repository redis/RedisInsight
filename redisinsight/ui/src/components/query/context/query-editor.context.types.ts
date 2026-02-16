import React, { ReactNode } from 'react'

import { IRedisCommand } from 'uiSrc/constants'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'
import { IEditorMount } from 'uiSrc/pages/workbench/interfaces'

export interface QueryEditorContextValue {
  // Editor instance
  monacoObjects: React.MutableRefObject<Nullable<IEditorMount>>

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

export interface QueryEditorContextProviderProps {
  children: ReactNode
  value: Omit<QueryEditorContextValue, 'monacoObjects'>
}
