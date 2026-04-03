import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { PaginationState } from 'uiSrc/components/base/layout/table'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  selectedKeyDataSelector,
  selectedKeySelector,
} from 'uiSrc/slices/browser/keys'
import {
  deleteVectorSetElements,
  fetchMoreVectorSetElements,
  vectorSetDataSelector,
  vectorSetSelector,
} from 'uiSrc/slices/browser/vectorSet'
import { RedisResponseBuffer, RedisString } from 'uiSrc/slices/interfaces'

import { getVectorSetColumns } from '../VectorSetElementList.config'
import {
  ElementDeleteConfig,
  ElementsListConfig,
} from '../VectorSetElementList.types'
import { DEFAULT_PAGE_SIZE } from '../constants'

const ELEMENT_DELETE_POPOVER_SUFFIX = '_vectorSet'
const MIN_COLUMN_WIDTH = 100

export interface UseVectorSetElementListDataParams {
  onRemoveKey: () => void
}

const useVectorSetElementListData = ({
  onRemoveKey,
}: UseVectorSetElementListDataParams) => {
  const { loading } = useSelector(vectorSetSelector)
  const { elements, nextCursor, total, isPaginationSupported } = useSelector(
    vectorSetDataSelector,
  )
  const { name: key } = useSelector(selectedKeyDataSelector) ?? { name: '' }
  const { compressor = null } = useSelector(connectedInstanceSelector)
  const { viewFormat } = useSelector(selectedKeySelector)

  const dispatch = useDispatch()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  })
  const [deleting, setDeleting] = useState('')

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [key])

  const closePopover = useCallback(() => {
    setDeleting('')
  }, [])

  const showPopover = useCallback((item = '') => {
    setDeleting(`${item + ELEMENT_DELETE_POPOVER_SUFFIX}`)
  }, [])

  const onSuccessRemoved = (newTotal: number) => {
    // If the vector set is empty, remove the vector set key
    if (newTotal === 0) {
      onRemoveKey()
    }
  }

  const handleDeleteElement = (element: RedisString | string = '') => {
    dispatch(
      deleteVectorSetElements(
        key as RedisResponseBuffer,
        [element as RedisResponseBuffer],
        onSuccessRemoved,
      ),
    )
    closePopover()
  }

  const handleRemoveIconClick = () => {}

  const columns = useMemo(() => {
    const deleteConfig: ElementDeleteConfig = {
      deleting,
      suffix: ELEMENT_DELETE_POPOVER_SUFFIX,
      total,
      keyName: key,
      closePopover,
      showPopover,
      handleDeleteElement,
      handleRemoveIconClick,
    }
    const listConfig: ElementsListConfig = {
      compressor: compressor as any,
      viewFormat,
      elementDeleteConfig: deleteConfig,
    }
    return getVectorSetColumns(listConfig)
  }, [compressor, viewFormat, deleting, total, key, closePopover, showPopover])

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

export default useVectorSetElementListData
