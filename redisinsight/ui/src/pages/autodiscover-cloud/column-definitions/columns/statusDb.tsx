import React from 'react'
import i18n from 'uiSrc/i18n'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCloud } from 'uiSrc/slices/interfaces'

import { StatusColumnText } from 'uiSrc/components/auto-discover'
import { AutoDiscoverCloudIds } from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const statusDbColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: i18n.t('autodiscover.cloud.column.status'),
    id: AutoDiscoverCloudIds.Status,
    accessorKey: AutoDiscoverCloudIds.Status,
    enableSorting: true,
    maxSize: 100,
    cell: ({
      row: {
        original: { status },
      },
    }) => <StatusColumnText>{status}</StatusColumnText>,
  }
}
