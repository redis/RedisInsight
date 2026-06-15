import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'

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

import { ElementsListConfig } from '../../vector-set-element-list/VectorSetElementList.types'
import {
  DEFAULT_PAGE_SIZE,
  ELEMENT_LIST_EMPTY_MESSAGE,
  ELEMENT_LIST_LOADING_MESSAGE,
} from '../../vector-set-element-list/constants'

import {
  UseVectorSetElementListDataParams,
  UseVectorSetElementListDataResult,
} from './useVectorSetElementListData.types'

export const useVectorSetElementListData = ({
  actionsConfig,
}: UseVectorSetElementListDataParams): UseVectorSetElementListDataResult => {
  const { loading } = useAppSelector(vectorSetSelector)
  const { elements, nextCursor, total, isPaginationSupported } = useAppSelector(
    vectorSetDataSelector,
  )
  const { name: key } = useAppSelector(selectedKeyDataSelector) ?? { name: '' }
  const { compressor = null } = useAppSelector(
    connectedInstanceSelector,
  ) as unknown as {
    compressor: Nullable<KeyValueCompressor>
  }
  const { viewFormat } = useAppSelector(selectedKeySelector)

  const dispatch = useAppDispatch()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  })

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [key])

  // Shared listConfig is passed via the table's `meta` so cells can read
  // `compressor` / `viewFormat` / `actionsConfig` without each column closing
  // over them. Lets the column defs stay static at module scope.
  const meta = useMemo<ElementsListConfig>(
    () => ({
      compressor,
      viewFormat,
      actionsConfig,
    }),
    [compressor, viewFormat, actionsConfig],
  )

  const currentPageData = useMemo(() => {
    if (!isPaginationSupported) return elements
    const { pageIndex, pageSize } = pagination
    return elements.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
  }, [elements, pagination, isPaginationSupported])

  const emptyMessage = loading
    ? ELEMENT_LIST_LOADING_MESSAGE
    : ELEMENT_LIST_EMPTY_MESSAGE

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
    meta,
    currentPageData,
    pagination,
    setPagination,
    emptyMessage,
    isPaginationSupported,
    total,
  }
}
