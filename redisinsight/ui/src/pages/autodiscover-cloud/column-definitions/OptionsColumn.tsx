import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import { DatabaseListOptions } from 'uiSrc/components'
import { parseInstanceOptionsCloud } from 'uiSrc/utils'

export const optionsColumn = (
  instances: InstanceRedisCloud[],
): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Options',
    id: 'options',
    accessorKey: 'options',
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
