import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCluster } from 'uiSrc/slices/interfaces'

import { ResultCell } from '../components/ResultCell'
import {
  RedisClusterIds,
  RedisClusterTitles,
} from 'uiSrc/pages/redis-cluster/constants/constants'

export const resultColumn = (): ColumnDef<InstanceRedisCluster> => {
  return {
    header: RedisClusterTitles.Result,
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
