import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
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
import { RedisResponseBuffer, VectorSetElement } from 'uiSrc/slices/interfaces'

import { getVectorSetColumns } from './VectorSetElementList.config'
import { DEFAULT_PAGE_SIZE, ENABLE_PAGINATION_COUNT } from './constants'
import * as S from './VectorSetElementList.styles'

const VectorSetElementList = memo(() => {
  const { loading } = useSelector(vectorSetSelector)
  const {
    elements: loadedElements,
    nextCursor,
    total,
  } = useSelector(vectorSetDataSelector)
  const { name: key } = useSelector(selectedKeyDataSelector) ?? { name: '' }
  const { compressor = null } = useSelector(connectedInstanceSelector)
  const { viewFormat } = useSelector(selectedKeySelector)

  const dispatch = useDispatch()

  const [elements, setElements] = useState<VectorSetElement[]>(loadedElements)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  })

  useEffect(() => {
    setElements(loadedElements)
  }, [loadedElements])

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [key])

  const paginationEnabled =
    !!nextCursor || elements.length > ENABLE_PAGINATION_COUNT

  const columns = useMemo(
    () => getVectorSetColumns({ compressor: compressor as any, viewFormat }),
    [compressor, viewFormat],
  )

  const MIN_COLUMN_WIDTH = 100
  const tableMinWidth = useMemo(
    () => `${Math.max(columns.length * MIN_COLUMN_WIDTH, 550)}px`,
    [columns.length],
  )

  const currentPageData = useMemo(() => {
    if (!paginationEnabled) return elements
    const { pageIndex, pageSize } = pagination
    return elements.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
  }, [elements, pagination, paginationEnabled])

  const emptyMessage = useMemo(() => {
    if (loading) return 'Loading...'
    return 'No results found.'
  }, [loading])

  const handlePaginationChange = useCallback(
    (newPagination: PaginationState) => {
      setPagination(newPagination)

      const { pageIndex, pageSize } = newPagination
      const requiredEnd = (pageIndex + 1) * pageSize

      if (requiredEnd > elements.length && nextCursor && !loading) {
        dispatch(
          fetchMoreVectorSetElements(key as RedisResponseBuffer, nextCursor),
        )
      }
    },
    [elements.length, nextCursor, key, loading, dispatch],
  )

  return (
    <S.Container data-testid="vector-set-details">
      <S.StyledTable
        columns={columns}
        data={currentPageData}
        stripedRows
        minWidth={tableMinWidth}
        paginationEnabled={paginationEnabled}
        manualPagination={paginationEnabled}
        totalRowCount={paginationEnabled ? total : undefined}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        emptyState={emptyMessage}
        data-testid="vector-set-details-table"
      />
    </S.Container>
  )
})

export { VectorSetElementList }
