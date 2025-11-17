import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCluster } from 'uiSrc/slices/interfaces'

import { EndpointCell } from '../components/EndpointCell'

export const endpointColumn = (): ColumnDef<InstanceRedisCluster> => {
  return {
    header: 'Endpoint',
    id: 'dnsName',
    accessorKey: 'dnsName',
    enableSorting: true,
    cell: ({
      row: {
        original: { dnsName, port },
      },
    }) => <EndpointCell dnsName={dnsName} port={port} />,
  }
}

