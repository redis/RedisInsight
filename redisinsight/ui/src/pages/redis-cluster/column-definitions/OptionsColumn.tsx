import React from 'react'
import { DatabaseListOptions } from 'uiSrc/components'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCluster } from 'uiSrc/slices/interfaces'
import { parseInstanceOptionsCluster } from 'uiSrc/utils'

export const OptionsColumn = (
  instances: InstanceRedisCluster[],
): ColumnDef<InstanceRedisCluster> => {
  return {
    header: 'Options',
    id: 'options',
    accessorKey: 'options',
    enableSorting: true,
    maxSize: 180,
    cell: ({ row: { original: instance } }) => {
      const options = parseInstanceOptionsCluster(instance?.uid, instances)
      return <DatabaseListOptions options={options} />
    },
  }
}
