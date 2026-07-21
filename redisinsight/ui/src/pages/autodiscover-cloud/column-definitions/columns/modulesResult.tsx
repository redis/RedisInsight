import React from 'react'
import i18n from 'uiSrc/i18n'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCloud } from 'uiSrc/slices/interfaces'

import { DatabaseListModules } from 'uiSrc/components'
import { AutoDiscoverCloudIds } from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const modulesResultColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: i18n.t('autodiscover.cloud.column.capabilities'),
    id: AutoDiscoverCloudIds.Modules,
    accessorKey: AutoDiscoverCloudIds.Modules,
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
