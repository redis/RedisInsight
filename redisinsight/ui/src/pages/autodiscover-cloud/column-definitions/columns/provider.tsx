import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type RedisCloudSubscription } from 'uiSrc/slices/interfaces'

import { CellText } from 'uiSrc/components/auto-discover'
import {
  AutoDiscoverCloudIds,
  AutoDiscoverCloudTitles,
} from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const providerColumn = (): ColumnDef<RedisCloudSubscription> => {
  return {
    id: AutoDiscoverCloudIds.Provider,
    accessorKey: AutoDiscoverCloudIds.Provider,
    header: AutoDiscoverCloudTitles.Provider,
    enableSorting: true,
    cell: ({
      row: {
        original: { provider },
      },
    }) => <CellText>{provider ?? '-'}</CellText>,
  }
}
