import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCloud } from 'uiSrc/slices/interfaces'

import { EndpointCell } from 'uiSrc/pages/autodiscover-cloud/components/columns/EndpointCell/EndpointCell'
import {
  AutoDiscoverCloudIds,
  AutoDiscoverCloudTitles,
} from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const endpointColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: AutoDiscoverCloudTitles.Endpoint,
    id: AutoDiscoverCloudIds.PublicEndpoint,
    accessorKey: AutoDiscoverCloudIds.PublicEndpoint,
    enableSorting: true,
    minSize: 200,
    cell: EndpointCell,
  }
}
