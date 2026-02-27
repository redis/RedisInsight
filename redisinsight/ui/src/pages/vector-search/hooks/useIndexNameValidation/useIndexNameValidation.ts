import { useMemo } from 'react'

import { useRedisearchListData } from '../useRedisearchListData'

export const INDEX_NAME_ERRORS = {
  DUPLICATE: 'An index with this name already exists.',
} as const

export const useIndexNameValidation = (indexName: string): string | null => {
  const { stringData: existingIndexes } = useRedisearchListData()

  return useMemo(() => {
    if (existingIndexes.includes(indexName.trim())) {
      return INDEX_NAME_ERRORS.DUPLICATE
    }
    return null
  }, [indexName, existingIndexes])
}
