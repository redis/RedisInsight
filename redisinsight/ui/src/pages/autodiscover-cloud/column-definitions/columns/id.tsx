import React from 'react'
import i18n from 'uiSrc/i18n'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type RedisCloudSubscription } from 'uiSrc/slices/interfaces'

import { CellText } from 'uiSrc/components/auto-discover'
import { AutoDiscoverCloudIds } from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const idColumn = (): ColumnDef<RedisCloudSubscription> => {
  return {
    id: AutoDiscoverCloudIds.Id,
    accessorKey: AutoDiscoverCloudIds.Id,
    header: i18n.t('autodiscover.cloud.column.id'),
    enableSorting: true,
    size: 80,
    cell: ({
      row: {
        original: { id },
      },
    }) => <CellText data-testid={`id_${id}`}>{id}</CellText>,
  }
}
