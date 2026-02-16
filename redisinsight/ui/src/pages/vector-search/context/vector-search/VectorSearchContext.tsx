import { createContext, useContext } from 'react'

import { VectorSearchContextValue } from './VectorSearchContext.types'

export const VectorSearchContext =
  createContext<VectorSearchContextValue | null>(null)

export const useVectorSearch = (): VectorSearchContextValue => {
  const ctx = useContext(VectorSearchContext)
  if (!ctx) {
    throw new Error('useVectorSearch must be used within VectorSearchProvider')
  }
  return ctx
}
