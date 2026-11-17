import React from 'react'
import i18n from 'uiSrc/i18n'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCloud } from 'uiSrc/slices/interfaces'

import { DatabaseListOptions } from 'uiSrc/components'
import { parseInstanceOptionsCloud } from 'uiSrc/utils'
import { AutoDiscoverCloudIds } from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const optionsColumn = (
  instances: InstanceRedisCloud[],
): ColumnDef<InstanceRedisCloud> => {
  return {
    header: i18n.t('autodiscover.cloud.column.options'),
    id: AutoDiscoverCloudIds.Options,
    accessorKey: AutoDiscoverCloudIds.Options,
    enableSorting: true,
    maxSize: 120,
    cell: ({ row: { original: instance } }) => {
      const options = parseInstanceOptionsCloud(
        instance.databaseId,
        instances || [],
      )
      return <DatabaseListOptions options={options} />
    },
  }
}
