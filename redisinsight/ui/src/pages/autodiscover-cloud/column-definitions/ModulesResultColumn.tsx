import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import { DatabaseListModules } from 'uiSrc/components'

export const modulesResultColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Capabilities',
    id: 'modules',
    accessorKey: 'modules',
    enableSorting: true,
    maxSize: 150,
    cell: function Modules({ row: { original: instance } }) {
      return (
        <DatabaseListModules
          modules={instance.modules?.map((name) => ({ name }))}
        />
      )
    },
  }
}
