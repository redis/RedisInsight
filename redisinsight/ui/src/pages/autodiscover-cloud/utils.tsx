import React from 'react'
import { SelectAllCheckbox } from 'uiSrc/pages/autodiscover-cloud/redis-cloud-subscriptions/RedisCloudSubscriptions/RedisCloudSubscriptions.styles'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import {
  ColumnDefinition,
  RowDefinition,
} from 'uiSrc/components/base/layout/table'

type Props = {
  size?: number
  id?: string
  enableResizing?: boolean
  canSelectRow?: (row: RowDefinition<any>) => boolean
  setSelection: (selection: any[]) => void
  onSelectionChange: (selection: any) => void
}

export const getSelectionColumn = <T extends object>({
  size = 50,
  id = 'select-col',
  enableResizing = false,
  canSelectRow = (_row: RowDefinition<T>) => true,
  setSelection,
  onSelectionChange,
}: Props): ColumnDefinition<T> => {
  return {
    id,
    size,
    enableResizing,
    header: ({ table }) => (
      <SelectAllCheckbox
        checked={table.getIsAllRowsSelected()}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const selected = event.target.checked
          table.toggleAllRowsSelected()
          if (selected) {
            const rows = table.getRowModel().rows
            setSelection(
              rows
                .filter((row) => canSelectRow(row))
                .map((row) => row.original),
            )
          } else {
            setSelection([])
          }
        }} //or getToggleAllPageRowsSelectedHandler
      />
    ),
    cell: ({ row }) => {
      let canSelect = true
      if (canSelectRow) {
        canSelect = canSelectRow(row)
      }
      return (
        <Checkbox
          checked={canSelect && row.getIsSelected()}
          disabled={!canSelect}
          onChange={() => {
            row.toggleSelected()
            onSelectionChange(row.original)
          }}
        />
      )
    },
  }
}
