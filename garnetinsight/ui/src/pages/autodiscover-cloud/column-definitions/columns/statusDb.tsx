import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCloud } from 'uiSrc/slices/interfaces'

import { StatusColumnText } from 'uiSrc/components/auto-discover'
import {
  AutoDiscoverCloudIds,
  AutoDiscoverCloudTitles,
} from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const statusDbColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: AutoDiscoverCloudTitles.Status,
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
