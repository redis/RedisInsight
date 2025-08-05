import React from 'react'

import { Loader } from 'uiSrc/components/base/display'
import { VectorSearchCreateIndex } from './create-index/VectorSearchCreateIndex'
import { VectorSearchQuery } from './query/VectorSearchQuery'
import { VectorSearchPageWrapper } from './styles'
import { useRedisearchListData } from './useRedisearchListData'

export const VectorSearchPage = () => {
  const { data, loading } = useRedisearchListData()
  const hasIndexes = data.length > 0

  return (
    <VectorSearchPageWrapper>
      {loading && <Loader />}
      {hasIndexes ? <VectorSearchQuery /> : <VectorSearchCreateIndex />}
    </VectorSearchPageWrapper>
  )
}
