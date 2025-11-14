import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import { DatabaseListOptions } from 'uiSrc/components'
import { parseInstanceOptionsCloud } from 'uiSrc/utils'

export const OPTIONS_RESULT_COLUMN_ID = 'options' as const

export const optionsResultColumn = (
  instancesForOptions: InstanceRedisCloud[],
): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Options',
    id: OPTIONS_RESULT_COLUMN_ID,
    accessorKey: OPTIONS_RESULT_COLUMN_ID,
    enableSorting: true,
    maxSize: 180,
    cell: function Options({ row: { original: instance } }) {
      const options = parseInstanceOptionsCloud(
        instance.databaseId,
        instancesForOptions,
      )
      return <DatabaseListOptions options={options} />
    },
  }
}
