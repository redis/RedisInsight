import React from 'react'
import i18n from 'uiSrc/i18n'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCloud } from 'uiSrc/slices/interfaces'

import { CellText } from 'uiSrc/components/auto-discover'
import { AutoDiscoverCloudIds } from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const statusDbResultColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: i18n.t('autodiscover.cloud.column.status'),
    id: AutoDiscoverCloudIds.Status,
    accessorKey: AutoDiscoverCloudIds.Status,
    enableSorting: true,
    size: 80,
    cell: ({
      row: {
        original: { status },
      },
    }) => <CellText className="column_status">{status}</CellText>,
  }
}
