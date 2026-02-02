import {
  Criteria,
  EuiInMemoryTable,
  EuiTableFieldDataColumnType,
  EuiTableSelectionType,
  PropertySort,
  EuiBasicTableProps,
} from '@elastic/eui'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { DatabaseListColumn } from 'uiSrc/constants'
import { Maybe } from 'uiSrc/utils'
import { findColumn, getColumnWidth, hideColumn } from './utils'

import { ActionBar, DeleteAction, ExportAction } from './components'

import * as S from './ItemList.styles'

export interface Props<T> {
  width: number
  columns: EuiTableFieldDataColumnType<T>[]
  shownColumns?: DatabaseListColumn[]
  hiddenColsOnResize?: string[]
  onDelete: (ids: T[]) => void
  hideExport?: boolean
  onExport?: (ids: T[], withSecrets: boolean) => void
  onWheel: () => void
  rowProps?: EuiBasicTableProps<T>['rowProps']
  getSelectableItems?: (item: T) => boolean
  loading: boolean
  data: T[]
  onTableChange: ({ sort, page }: Criteria<T>) => void
  sort: PropertySort
  hideSelectableCheckboxes?: boolean
}

function ItemList<T extends { id: string; visible?: boolean }>({
  width,
  columns: incomingColumns,
  shownColumns,
  hiddenColsOnResize = [],
  onDelete,
  hideExport = false,
  onExport,
  onWheel,
  rowProps,
  getSelectableItems,
  loading,
  data: instances,
  onTableChange,
  sort,
  hideSelectableCheckboxes,
}: Props<T>) {
  const [selection, setSelection] = useState<T[]>([])
  const [message, setMessage] = useState<Maybe<string | JSX.Element>>(undefined)

  const tableRef = useRef<EuiInMemoryTable<T>>(null)
  const containerTableRef = useRef<HTMLDivElement>(null)

  const hiddenCols = useRef<Set<string>>(new Set([]))
  const lastHiddenColumn = useRef<EuiTableFieldDataColumnType<T>>()

  const visibleColumns = useMemo(() => {
    if (!incomingColumns?.length) return []
    let filteredColumns = incomingColumns
    if (shownColumns && shownColumns.length) {
      filteredColumns = incomingColumns.filter((col) =>
        shownColumns.includes(col.field as DatabaseListColumn),
      )
    }

    const adjustColumns = (
      cols: EuiTableFieldDataColumnType<T>[],
      offsetWidth: number,
    ): EuiTableFieldDataColumnType<T>[] => {
      let sum = cols?.reduce(
        (prev, next) => prev + getColumnWidth(next.width),
        0,
      )
      const visibleColumnsLength = cols.length - hiddenCols.current.size

      // hide columns
      if (
        sum > offsetWidth &&
        hiddenColsOnResize.length + visibleColumnsLength
      ) {
        let resultsCol = [...cols]
        while (sum > offsetWidth) {
          const colToHide = hiddenColsOnResize[hiddenCols.current.size]
          const initialCol = findColumn(filteredColumns, colToHide)
          if (!initialCol) return resultsCol

          sum -= getColumnWidth(initialCol?.width)
          hiddenCols.current.add(colToHide)
          lastHiddenColumn.current = initialCol
          resultsCol = resultsCol.map((item) =>
            item.field === colToHide ? hideColumn(item) : item,
          )
        }

        return resultsCol
      }

      // show columns
      if (filteredColumns.length > visibleColumnsLength) {
        // early return to not calculate other columns
        const lastHiddenColWidth = getColumnWidth(
          lastHiddenColumn.current?.width,
        )
        if (sum + lastHiddenColWidth > offsetWidth) {
          return cols
        }

        let resultsCol = [...cols]
        Array.from(hiddenCols.current)
          .reverse()
          .forEach((hiddenCol) => {
            const initialCol = findColumn(filteredColumns, hiddenCol)
            if (!initialCol) return

            const hiddenColWidth = getColumnWidth(initialCol.width)
            if (hiddenColWidth + sum < offsetWidth) {
              hiddenCols.current.delete(hiddenCol)
              sum += hiddenColWidth
              lastHiddenColumn.current = initialCol
              resultsCol = resultsCol.map((item) =>
                item.field === hiddenCol ? initialCol : item,
              )
            }
          })

        return resultsCol
      }

      return cols
    }

    if (hiddenColsOnResize?.length && containerTableRef.current) {
      const { offsetWidth } = containerTableRef.current
      const beforeAdjustHiddenCols = hiddenCols.current.size
      try {
        const currentColumns = filteredColumns.filter(
          (fc) => !hiddenCols.current.has(fc.field.toString()),
        )
        const adjustedColumns = adjustColumns(currentColumns, offsetWidth)
        if (beforeAdjustHiddenCols !== hiddenCols.current.size) {
          return adjustedColumns
        }
        return currentColumns
      } catch (_) {
        // ignore
      }
    }

    return filteredColumns
  }, [incomingColumns, shownColumns, width, hiddenColsOnResize])

  useEffect(() => {
    if (loading) {
      setMessage('loading...')
      return
    }

    if (!instances.length) {
      // TODO: add proper message about no instances
      setMessage('No Added instances')
      return
    }

    if (instances.length && instances.every(({ visible }) => !visible)) {
      setMessage(
        <S.NoResults>
          <S.TableMsgTitle>No results found</S.TableMsgTitle>
          <div>No results matched your search. Try reducing the criteria.</div>
        </S.NoResults>,
      )
    }
  }, [instances, loading])

  const selectionValue: EuiTableSelectionType<T> = {
    selectable: (item) =>
      getSelectableItems ? getSelectableItems?.(item) : true,
    onSelectionChange: (selected: T[]) => {
      setSelection(selected)
    },
  }

  const handleResetSelection = () => {
    tableRef.current?.setSelection([])
  }

  const handleDelete = () => {
    onDelete(selection)
  }

  const handleExport = (instances: T[], withSecrets: boolean) => {
    onExport?.(instances, withSecrets)
    tableRef.current?.setSelection([])
  }

  const actionMsg = (action: string) => `
    Selected
    ${' '}
    ${selection.length}
    ${' '}
    items will be ${action} from
    RedisInsight:
  `

  return (
    <div
      className={`itemList ${hideSelectableCheckboxes ? 'hideSelectableCheckboxes' : ''}`}
      ref={containerTableRef}
    >
      <EuiInMemoryTable
        ref={tableRef}
        items={instances.filter(({ visible = true }) => visible)}
        itemId="id"
        loading={loading}
        message={message}
        columns={visibleColumns ?? []}
        rowProps={rowProps}
        sorting={{ sort }}
        selection={selectionValue}
        onWheel={onWheel}
        onTableChange={onTableChange}
        className="stickyHeader"
        isSelectable
      />

      {selection.length > 0 && (
        <ActionBar
          selectionCount={selection.length}
          onCloseActionBar={handleResetSelection}
          actions={[
            !hideExport ? (
              <ExportAction<T>
                selection={selection}
                onExport={handleExport}
                subTitle={actionMsg('exported')}
              />
            ) : null,
            <DeleteAction<T>
              selection={selection}
              onDelete={handleDelete}
              subTitle={actionMsg('deleted')}
            />,
          ]}
          width={width}
        />
      )}
    </div>
  )
}

export default ItemList
