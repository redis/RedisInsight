import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCloud } from 'uiSrc/slices/interfaces'

import { DatabaseCell } from 'uiSrc/pages/autodiscover-cloud/components/columns/DatabaseCell/DatabaseCell'
import {
  AutoDiscoverCloudIds,
  AutoDiscoverCloudTitles,
} from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const databaseColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: AutoDiscoverCloudTitles.Database,
    id: AutoDiscoverCloudIds.Name,
    accessorKey: AutoDiscoverCloudIds.Name,
    enableSorting: true,
    maxSize: 150,
    cell: DatabaseCell,
  }
}
