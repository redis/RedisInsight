import React from 'react'
import i18n from 'uiSrc/i18n'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCloud } from 'uiSrc/slices/interfaces'

import { EndpointCell } from '../components/EndpointCell/EndpointCell'
import { AutoDiscoverCloudIds } from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const endpointResultColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: i18n.t('autodiscover.cloud.column.endpoint'),
    id: AutoDiscoverCloudIds.PublicEndpoint,
    accessorKey: AutoDiscoverCloudIds.PublicEndpoint,
    enableSorting: true,
    minSize: 250,
    maxSize: 310,
    cell: ({
      row: {
        original: { publicEndpoint },
      },
    }) => <EndpointCell publicEndpoint={publicEndpoint} />,
  }
}
