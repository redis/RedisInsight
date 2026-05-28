import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { PaginationState } from 'uiSrc/components/base/layout/table'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  selectedKeyDataSelector,
  selectedKeySelector,
} from 'uiSrc/slices/browser/keys'
import {
  fetchMoreVectorSetElements,
  vectorSetDataSelector,
  vectorSetSelector,
} from 'uiSrc/slices/browser/vectorSet'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { KeyValueCompressor } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/utils'

import { getVectorSetColumns } from '../../vector-set-element-list/VectorSetElementList.config'
import { ElementsListConfig } from '../../vector-set-element-list/VectorSetElementList.types'
import { DEFAULT_PAGE_SIZE } from '../../vector-set-element-list/constants'

import {
  UseVectorSetElementListDataParams,
  UseVectorSetElementListDataResult,
} from './useVectorSetElementListData.types'

const MIN_COLUMN_WIDTH = 100

export const useVectorSetElementListData = ({
  actionsConfig,
}: UseVectorSetElementListDataParams): UseVectorSetElementListDataResult => {
  const { loading } = useSelector(vectorSetSelector)
  const { elements, nextCursor, total, isPaginationSupported } = useSelector(
    vectorSetDataSelector,
  )
  const { name: key } = useSelector(selectedKeyDataSelector) ?? { name: '' }
  const { compressor = null } = useSelector(
    connectedInstanceSelector,
  ) as unknown as {
    compressor: Nullable<KeyValueCompressor>
  }
  const { viewFormat } = useSelector(selectedKeySelector)

  const dispatch = useDispatch()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  })

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [key])

  const columns = useMemo(() => {
    const listConfig: ElementsListConfig = {
      compressor,
      viewFormat,
      actionsConfig,
    }
    return getVectorSetColumns(listConfig)
  }, [compressor, viewFormat, actionsConfig])

  const tableMinWidth = useMemo(
    () => `${Math.max(columns.length * MIN_COLUMN_WIDTH, 550)}px`,
    [columns.length],
  )

  const currentPageData = useMemo(() => {
    if (!isPaginationSupported) return elements
    const { pageIndex, pageSize } = pagination
    return elements.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
  }, [elements, pagination, isPaginationSupported])

  const emptyMessage = useMemo(() => {
    if (loading) return 'Loading...'
    return 'No results found.'
  }, [loading])

  useEffect(() => {
    const { pageIndex, pageSize } = pagination
    const requiredEnd = (pageIndex + 1) * pageSize

    if (requiredEnd > elements.length && nextCursor && !loading) {
      dispatch(
        fetchMoreVectorSetElements({
          key: key as RedisResponseBuffer,
          nextCursor,
          count: pageSize,
        }),
      )
    }
  }, [pagination, elements, nextCursor, loading, key, dispatch])

  return {
    columns,
    currentPageData,
    tableMinWidth,
    pagination,
    setPagination,
    emptyMessage,
    isPaginationSupported,
    total,
  }
}
