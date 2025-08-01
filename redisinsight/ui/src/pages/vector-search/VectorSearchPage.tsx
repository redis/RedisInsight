import React from 'react'

import { VectorSearchCreateIndex } from './create-index/VectorSearchCreateIndex'
import { VectorSearchQuery } from './query/VectorSearchQuery'

export const VectorSearchPage = () => {
  const hasIndexes = true

  if (!hasIndexes) {
    return <VectorSearchCreateIndex />
  }

  return <VectorSearchQuery />
}
