import React from 'react'
import { useSelector } from 'react-redux'

import { redisearchListSelector } from 'uiSrc/slices/browser/redisearch'
import { VectorSearchCreateIndex } from './create-index/VectorSearchCreateIndex'
import { VectorSearchQuery } from './query/VectorSearchQuery'

export const VectorSearchPage = () => {
  const { loading, data } = useSelector(redisearchListSelector)

  const hasIndexes = data && data.length

  if (!hasIndexes) {
    return <VectorSearchCreateIndex />
  }

  return <VectorSearchQuery />
}
