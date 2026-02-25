import { useMemo } from 'react'

import { useRedisearchListData } from '../useRedisearchListData'

export const INDEX_NAME_ERRORS = {
  REQUIRED: 'Index name is required.',
  DUPLICATE: 'An index with this name already exists.',
} as const

export const useIndexNameValidation = (indexName: string): string | null => {
  const { stringData: existingIndexes } = useRedisearchListData()

  return useMemo(() => {
    if (!indexName.trim()) return INDEX_NAME_ERRORS.REQUIRED
    if (existingIndexes.includes(indexName.trim())) {
      return INDEX_NAME_ERRORS.DUPLICATE
    }
    return null
  }, [indexName, existingIndexes])
}
