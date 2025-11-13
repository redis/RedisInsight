import { useMemo, useRef, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'

import {
  ColumnDef,
  RowSelectionState,
} from 'uiSrc/components/base/layout/table'
import { RdiInstance } from 'uiSrc/slices/interfaces'
import { instancesSelector } from 'uiSrc/slices/rdi/instances'

import {
  ENABLE_PAGINATION_COUNT,
  BASE_COLUMNS,
} from '../RdiInstancesList.config'

const useRdiInstancesListData = () => {
  const { data: instances, loading } = useSelector(instancesSelector)

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const resetRowSelection = useCallback(() => setRowSelection({}), [])

  const paginationEnabledRef = useRef(false)
  paginationEnabledRef.current =
    paginationEnabledRef.current || instances.length > ENABLE_PAGINATION_COUNT

  const columns: ColumnDef<RdiInstance>[] = useMemo(
    () => BASE_COLUMNS,
    // TODO: filter columns based on shownColumns as in databases list (not implemented)
    [],
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
