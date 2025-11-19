import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCluster } from 'uiSrc/slices/interfaces'

import { EndpointCell } from '../components/EndpointCell'
import {
  RedisClusterIds,
  RedisClusterTitles,
} from 'uiSrc/pages/redis-cluster/constants/constants'

export const endpointColumn = (): ColumnDef<InstanceRedisCluster> => {
  return {
    header: RedisClusterTitles.Endpoint,
    id: RedisClusterIds.Endpoint,
    accessorKey: RedisClusterIds.Endpoint,
    enableSorting: true,
    cell: ({
      row: {
        original: { dnsName, port },
      },
    }) => <EndpointCell dnsName={dnsName} port={port} />,
  }
}

