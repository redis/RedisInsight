import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import { DatabaseListOptions } from 'uiSrc/components'
import { parseInstanceOptionsCloud } from 'uiSrc/utils'

export const OPTIONS_COLUMN_ID = 'options' as const

export const optionsColumn = (
  instances: InstanceRedisCloud[],
): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Options',
    id: OPTIONS_COLUMN_ID,
    accessorKey: OPTIONS_COLUMN_ID,
    enableSorting: true,
    maxSize: 120,
    cell: ({ row: { original: instance } }) => {
      const options = parseInstanceOptionsCloud(
        instance.databaseId,
        instances || [],
      )
      return <DatabaseListOptions options={options} />
    },
  }
}
