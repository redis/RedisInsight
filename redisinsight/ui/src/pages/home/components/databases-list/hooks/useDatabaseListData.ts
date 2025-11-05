import { useMemo, useState, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'

import { Instance } from 'uiSrc/slices/interfaces'
import { instancesSelector } from 'uiSrc/slices/instances/instances'
import {
  ColumnDef,
  RowSelectionState,
} from 'uiSrc/components/base/layout/table'
import { DatabaseListColumn } from 'uiSrc/constants'

import {
  SELECT_COL_ID,
  BASE_COLUMNS,
  ENABLE_PAGINATION_COUNT,
} from '../DatabasesList.config'

const useDatabaseListData = () => {
  const {
    data: instances,
    loading,
    shownColumns,
  } = useSelector(instancesSelector)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const resetRowSelection = useCallback(() => {
    setRowSelection({})
  }, [])

  const paginationEnabledRef = useRef(false)
  paginationEnabledRef.current =
    // Workaround: table breaks if pagination is disabled after it was previously enabled
    paginationEnabledRef.current || instances.length > ENABLE_PAGINATION_COUNT

  const columns: ColumnDef<Instance>[] = useMemo(
    () =>
      BASE_COLUMNS.filter(
        (col) =>
          col.id === SELECT_COL_ID ||
          shownColumns.includes(col.id as DatabaseListColumn),
      ),
    [shownColumns],
  )

  const visibleInstances = useMemo(
    () => instances.filter(({ visible = true }) => visible),
    [instances],
  )

  const selectedInstances = useMemo(
    () => visibleInstances.filter((_instance, index) => rowSelection[index]),
    [rowSelection, visibleInstances],
  )

  const emptyMessage = useMemo(() => {
    if (loading) {
      return 'Loading...'
    }
    if (!instances.length) {
      return 'No added instances'
    }
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

export default useDatabaseListData
