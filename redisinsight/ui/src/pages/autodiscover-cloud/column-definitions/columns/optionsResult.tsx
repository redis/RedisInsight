import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import { DatabaseListOptions } from 'uiSrc/components'
import { parseInstanceOptionsCloud } from 'uiSrc/utils'
import {
  AutoDiscoverCloudIds,
  AutoDiscoverCloudTitles,
} from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const optionsResultColumn = (
  instancesForOptions: InstanceRedisCloud[],
): ColumnDef<InstanceRedisCloud> => {
  return {
    header: AutoDiscoverCloudTitles.Options,
    id: AutoDiscoverCloudIds.Options,
    accessorKey: AutoDiscoverCloudIds.Options,
    enableSorting: true,
    maxSize: 180,
    cell: function Options({ row: { original: instance } }) {
      const options = parseInstanceOptionsCloud(
        instance.databaseId,
        instancesForOptions,
      )
      return <DatabaseListOptions options={options} />
    },
  }
}
