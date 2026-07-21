import React from 'react'
import i18n from 'uiSrc/i18n'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCloud } from 'uiSrc/slices/interfaces'

import { DatabaseCell } from '../components/DatabaseCell/DatabaseCell'
import { AutoDiscoverCloudIds } from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const databaseColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: i18n.t('autodiscover.cloud.column.database'),
    id: AutoDiscoverCloudIds.Name,
    accessorKey: AutoDiscoverCloudIds.Name,
    enableSorting: true,
    maxSize: 150,
    cell: ({
      row: {
        original: { name },
      },
    }) => <DatabaseCell name={name} />,
  }
}
