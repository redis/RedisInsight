import { useMemo, useRef, useState, useCallback } from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'

import {
  ColumnDef,
  RowSelectionState,
} from 'uiSrc/components/base/layout/table'
import { RdiInstance } from 'uiSrc/slices/interfaces'
import { instancesSelector } from 'uiSrc/slices/rdi/instances'
import { RdiListColumn } from 'uiSrc/constants'
import { useTranslation } from 'uiSrc/i18n'

import {
  ENABLE_PAGINATION_COUNT,
  getBaseColumns,
  SELECT_COL_ID,
} from '../RdiInstancesList.config'

const useRdiInstancesListData = () => {
  const { t } = useTranslation()
  const {
    data: instances,
    loading,
    shownColumns,
  } = useAppSelector(instancesSelector)

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const resetRowSelection = useCallback(() => setRowSelection({}), [])

  const paginationEnabledRef = useRef(false)
  paginationEnabledRef.current =
    paginationEnabledRef.current || instances.length > ENABLE_PAGINATION_COUNT

  const columns: ColumnDef<RdiInstance>[] = useMemo(
    () =>
      getBaseColumns(t).filter(
        (col) =>
          col.id === SELECT_COL_ID ||
          (shownColumns as RdiListColumn[]).includes(col.id as RdiListColumn),
      ),
    [shownColumns, t],
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
    if (loading) return t('rdi.home.list.empty.loading')
    if (!instances.length) return t('rdi.home.list.empty.noEndpoints')
    return t('rdi.home.list.empty.noResults')
  }, [loading, instances.length, t])

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
