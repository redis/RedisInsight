import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { PaginationState } from 'uiSrc/components/base/layout/table'
import {
  selectedKeyDataSelector,
  selectedKeySelector,
  setSelectedKeyRefreshDisabled,
} from 'uiSrc/slices/browser/keys'
import {
  addArrayElements,
  addArrayElementsStateSelector,
  arrayDataSelector,
  arraySelector,
  deleteArrayElements,
  fetchMoreArrayElements,
} from 'uiSrc/slices/browser/array'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

import { getArrayColumns } from '../array-element-list/ArrayElementList.config'
import { DEFAULT_PAGE_SIZE } from '../array-element-list/constants'

const ELEMENT_DELETE_POPOVER_SUFFIX = '_array'
const MIN_COLUMN_WIDTH = 100

export const useArrayElementListData = ({
  onRemoveKey,
}: {
  onRemoveKey: () => void
}) => {
  const { loading } = useSelector(arraySelector)
  const { loading: updateLoading } = useSelector(addArrayElementsStateSelector)
  const {
    elements = [],
    nextCursor,
    total = 0,
  } = useSelector(arrayDataSelector) ?? {}
  const { name: key } = useSelector(selectedKeyDataSelector) ?? { name: '' }
  const { viewFormat } = useSelector(selectedKeySelector)

  const dispatch = useDispatch()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  })
  const [deleting, setDeleting] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [key])

  const closePopover = useCallback(() => {
    setDeleting('')
  }, [])

  const showPopover = useCallback((item = '') => {
    setDeleting(`${item}${ELEMENT_DELETE_POPOVER_SUFFIX}`)
  }, [])

  const onSuccessRemoved = (newTotal: number) => {
    if (newTotal === 0) {
      onRemoveKey()
    }
  }

  const handleDeleteElement = useCallback(
    (index: number) => {
      dispatch(
        deleteArrayElements(
          key as RedisResponseBuffer,
          [index],
          onSuccessRemoved,
        ),
      )
      closePopover()
    },
    [key, dispatch, closePopover],
  )

  const handleEditElement = useCallback(
    (arrayIndex: number, isEditing: boolean) => {
      setEditingIndex(isEditing ? arrayIndex : null)
      dispatch(setSelectedKeyRefreshDisabled(isEditing))
    },
    [dispatch],
  )

  const handleApplyEditValue = useCallback(
    (arrayIndex: number, value: string) => {
      dispatch(
        addArrayElements(
          {
            keyName: key as RedisResponseBuffer,
            elements: [{ index: arrayIndex, value }],
          },
          () => handleEditElement(arrayIndex, false),
        ),
      )
    },
    [key, dispatch, handleEditElement],
  )

  const columns = useMemo(
    () =>
      getArrayColumns({
        viewFormat,
        elementDeleteConfig: {
          deleting,
          suffix: ELEMENT_DELETE_POPOVER_SUFFIX,
          total,
          keyName: key,
          closePopover,
          showPopover,
          handleDeleteElement,
        },
        elementEditConfig: {
          editingIndex,
          updateLoading,
          handleEditElement,
          handleApplyEditValue,
        },
      }),
    [
      viewFormat,
      deleting,
      total,
      key,
      closePopover,
      showPopover,
      handleDeleteElement,
      editingIndex,
      updateLoading,
      handleEditElement,
      handleApplyEditValue,
    ],
  )

  const tableMinWidth = useMemo(
    () => `${Math.max(columns.length * MIN_COLUMN_WIDTH, 400)}px`,
    [columns.length],
  )

  const currentPageData = useMemo(() => {
    const { pageIndex, pageSize } = pagination
    return elements.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
  }, [elements, pagination])

  const emptyMessage = useMemo(() => {
    if (loading) return 'Loading...'
    return 'No elements found.'
  }, [loading])

  // Fetch more elements when the user pages past what we've already loaded
  useEffect(() => {
    const { pageIndex, pageSize } = pagination
    const requiredEnd = (pageIndex + 1) * pageSize

    if (requiredEnd > elements.length && nextCursor !== undefined && !loading) {
      dispatch(
        fetchMoreArrayElements({
          key: key as RedisResponseBuffer,
          cursor: nextCursor,
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
    total,
  }
}
