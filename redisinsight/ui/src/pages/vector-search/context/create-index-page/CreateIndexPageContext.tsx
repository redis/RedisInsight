import { createContext, useContext } from 'react'

import { CreateIndexPageContextValue } from './CreateIndexPageContext.types'

export const CreateIndexPageContext =
  createContext<CreateIndexPageContextValue | null>(null)

export const useCreateIndexPage = (): CreateIndexPageContextValue => {
  const ctx = useContext(CreateIndexPageContext)
  if (!ctx) {
    throw new Error(
      'useCreateIndexPage must be used within CreateIndexPageProvider',
    )
  }
  return ctx
}
