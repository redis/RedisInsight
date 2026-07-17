import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCluster } from 'uiSrc/slices/interfaces'

import i18n from 'uiSrc/i18n'
import { EndpointCell } from '../components/EndpointCell'
import { RedisClusterIds } from 'uiSrc/pages/redis-cluster/constants/constants'

export const endpointColumn = (): ColumnDef<InstanceRedisCluster> => {
  return {
    header: i18n.t('cluster.column.endpoint'),
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
