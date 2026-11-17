import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCluster } from 'uiSrc/slices/interfaces'

import i18n from 'uiSrc/i18n'
import { ResultCell } from '../components/ResultCell'
import { RedisClusterIds } from 'uiSrc/pages/redis-cluster/constants/constants'

export const resultColumn = (): ColumnDef<InstanceRedisCluster> => {
  return {
    header: i18n.t('cluster.column.result'),
    id: RedisClusterIds.Result,
    accessorKey: RedisClusterIds.Result,
    enableSorting: true,
    cell: ({
      row: {
        original: { statusAdded, messageAdded },
      },
    }) => <ResultCell statusAdded={statusAdded} messageAdded={messageAdded} />,
  }
}
