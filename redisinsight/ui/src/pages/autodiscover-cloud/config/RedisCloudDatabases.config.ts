import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCloud } from 'uiSrc/slices/interfaces'

import { getSelectionColumn } from 'uiSrc/pages/autodiscover-cloud/utils'
import {
  DatabaseCell,
  SubscriptionIdCell,
  SubscriptionDbCell,
  SubscriptionTypeCell,
  DatabaseStatusCell,
  EndpointCell,
  ModulesCell,
  OptionsCell,
} from '../components/columns'
import {
  AutoDiscoverCloudIds,
  AutoDiscoverCloudTitles,
} from '../constants/constants'

export const redisCloudDatabasesColumns = (
  instances: InstanceRedisCloud[],
): ColumnDef<InstanceRedisCloud>[] => [
  getSelectionColumn<InstanceRedisCloud>({
    id: AutoDiscoverCloudIds.SelectionDatabases,
  }),
  {
    header: AutoDiscoverCloudTitles.Database,
    id: AutoDiscoverCloudIds.Name,
    accessorKey: AutoDiscoverCloudIds.Name,
    enableSorting: true,
    maxSize: 150,
    cell: DatabaseCell,
  },
  {
    header: AutoDiscoverCloudTitles.SubscriptionId,
    id: AutoDiscoverCloudIds.SubscriptionId,
    accessorKey: AutoDiscoverCloudIds.SubscriptionId,
    enableSorting: true,
    maxSize: 120,
    cell: SubscriptionIdCell,
  },
  {
    header: AutoDiscoverCloudTitles.Subscription,
    id: AutoDiscoverCloudIds.SubscriptionName,
    accessorKey: AutoDiscoverCloudIds.SubscriptionName,
    enableSorting: true,
    minSize: 200,
    cell: SubscriptionDbCell,
  },
  {
    header: AutoDiscoverCloudTitles.Type,
    id: AutoDiscoverCloudIds.SubscriptionType,
    accessorKey: AutoDiscoverCloudIds.SubscriptionType,
    enableSorting: true,
    maxSize: 100,
    cell: SubscriptionTypeCell,
  },
  {
    header: AutoDiscoverCloudTitles.Status,
    id: AutoDiscoverCloudIds.Status,
    accessorKey: AutoDiscoverCloudIds.Status,
    enableSorting: true,
    maxSize: 100,
    cell: DatabaseStatusCell,
  },
  {
    header: AutoDiscoverCloudTitles.Endpoint,
    id: AutoDiscoverCloudIds.PublicEndpoint,
    accessorKey: AutoDiscoverCloudIds.PublicEndpoint,
    enableSorting: true,
    minSize: 200,
    cell: EndpointCell,
  },
  {
    header: AutoDiscoverCloudTitles.Capabilities,
    id: AutoDiscoverCloudIds.Modules,
    accessorKey: AutoDiscoverCloudIds.Modules,
    enableSorting: true,
    maxSize: 120,
    cell: ModulesCell,
  },
  {
    header: AutoDiscoverCloudTitles.Options,
    id: AutoDiscoverCloudIds.Options,
    accessorKey: AutoDiscoverCloudIds.Options,
    enableSorting: true,
    maxSize: 120,
    cell: OptionsCell,
    meta: {
      props: {
        instances,
      },
    },
  },
]
