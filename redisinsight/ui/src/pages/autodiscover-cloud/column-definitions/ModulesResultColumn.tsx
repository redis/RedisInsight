import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import { DatabaseListModules } from 'uiSrc/components'

export const MODULES_RESULT_COLUMN_ID = 'modules' as const

export const modulesResultColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Capabilities',
    id: MODULES_RESULT_COLUMN_ID,
    accessorKey: MODULES_RESULT_COLUMN_ID,
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
