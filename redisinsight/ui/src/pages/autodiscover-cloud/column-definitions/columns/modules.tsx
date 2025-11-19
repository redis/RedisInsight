import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCloud } from 'uiSrc/slices/interfaces'

import { DatabaseListModules } from 'uiSrc/components'
import { AutoDiscoverCloudIds } from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const modulesColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Capabilities',
    id: AutoDiscoverCloudIds.Modules,
    accessorKey: AutoDiscoverCloudIds.Modules,
    enableSorting: true,
    maxSize: 120,
    cell: function Modules({ row: { original: instance } }) {
      return (
        <DatabaseListModules
          modules={instance.modules.map((name) => ({ name }))}
        />
      )
    },
  }
}
