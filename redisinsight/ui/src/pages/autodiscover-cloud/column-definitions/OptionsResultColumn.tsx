import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import { DatabaseListOptions } from 'uiSrc/components'
import { parseInstanceOptionsCloud } from 'uiSrc/utils'

export const OptionsResultColumn = (
  instancesForOptions: InstanceRedisCloud[],
): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Options',
    id: 'options',
    accessorKey: 'options',
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
