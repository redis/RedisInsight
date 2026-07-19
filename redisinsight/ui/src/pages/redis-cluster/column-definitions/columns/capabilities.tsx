import React from 'react'
import { DatabaseListModules } from 'uiSrc/components'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCluster } from 'uiSrc/slices/interfaces'
import i18n from 'uiSrc/i18n'
import { RedisClusterIds } from 'uiSrc/pages/redis-cluster/constants/constants'

export const capabilitiesColumn = (): ColumnDef<InstanceRedisCluster> => {
  return {
    header: i18n.t('cluster.column.capabilities'),
    id: RedisClusterIds.Capabilities,
    accessorKey: RedisClusterIds.Capabilities,
    enableSorting: true,
    maxSize: 150,
    cell: function Modules({ row: { original: instance } }) {
      return (
        <DatabaseListModules
          modules={instance?.modules?.map((name) => ({ name }))}
        />
      )
    },
  }
}
