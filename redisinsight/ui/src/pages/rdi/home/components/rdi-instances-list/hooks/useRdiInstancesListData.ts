import { useMemo, useRef, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'

import {
  ColumnDef,
  RowSelectionState,
} from 'uiSrc/components/base/layout/table'
import { RdiInstance } from 'uiSrc/slices/interfaces'
import { instancesSelector } from 'uiSrc/slices/rdi/instances'
import { RdiListColumn } from 'uiSrc/constants'

import {
  ENABLE_PAGINATION_COUNT,
  BASE_COLUMNS,
  SELECT_COL_ID,
} from '../RdiInstancesList.config'

const useRdiInstancesListData = () => {
  const {
    data: instances,
    loading,
    shownColumns,
  } = useSelector(instancesSelector)

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const resetRowSelection = useCallback(() => setRowSelection({}), [])

  const paginationEnabledRef = useRef(false)
  paginationEnabledRef.current =
    paginationEnabledRef.current || instances.length > ENABLE_PAGINATION_COUNT

  const columns: ColumnDef<RdiInstance>[] = useMemo(
    () =>
      BASE_COLUMNS.filter(
        (col) =>
          col.id === SELECT_COL_ID ||
          (shownColumns as RdiListColumn[]).includes(col.id as RdiListColumn),
      ),
    [shownColumns],
  )

  const visibleInstances = useMemo(
    () => instances.filter(({ visible = true }) => visible),
    [instances],
  )

  const selectedInstances = useMemo(
    () =>
      visibleInstances.filter((_instance: RdiInstance, index: number) =>
        Boolean(rowSelection[index]),
      ),
    [rowSelection, visibleInstances],
  )

  const emptyMessage = useMemo(() => {
    if (loading) return 'Loading...'
    if (!instances.length) return 'No added endpoints'
    return 'No results found'
  }, [loading, instances.length])

  return {
    loading,
    columns,
    visibleInstances,
    selectedInstances,
    paginationEnabled: paginationEnabledRef.current,
    rowSelection,
    emptyMessage,
    setRowSelection,
    resetRowSelection,
  }
}

export default useRdiInstancesListData
