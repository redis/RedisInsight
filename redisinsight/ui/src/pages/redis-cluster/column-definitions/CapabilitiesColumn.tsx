import React from 'react'
import { DatabaseListModules } from 'uiSrc/components'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCluster } from 'uiSrc/slices/interfaces'

export const CapabilitiesColumn = (): ColumnDef<InstanceRedisCluster> => {
  return {
    header: 'Capabilities',
    id: 'modules',
    accessorKey: 'modules',
    enableSorting: true,
    maxSize: 150,
    cell: function Modules({ row: { original: instance } }) {
      return (
        <DatabaseListModules
          modules={instance?.modules?.map((name) => ({ name }))}
        />
      )
    },
  }
}
