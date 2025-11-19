import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type RedisCloudSubscription } from 'uiSrc/slices/interfaces'

import { CellText } from 'uiSrc/components/auto-discover'
import {
  AutoDiscoverCloudIds,
  AutoDiscoverCloudTitles,
} from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const regionColumn = (): ColumnDef<RedisCloudSubscription> => {
  return {
    id: AutoDiscoverCloudIds.Region,
    accessorKey: AutoDiscoverCloudIds.Region,
    header: AutoDiscoverCloudTitles.Region,
    enableSorting: true,
    cell: ({
      row: {
        original: { region },
      },
    }) => <CellText>{region ?? '-'}</CellText>,
  }
}
