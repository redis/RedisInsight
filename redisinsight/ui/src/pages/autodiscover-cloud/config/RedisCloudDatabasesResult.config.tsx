import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCloud } from 'uiSrc/slices/interfaces'

import {
  DatabaseCell,
  SubscriptionDbCell,
  StatusResultCell,
  EndpointCell,
  ModulesCell,
  OptionsCell,
  MessageResultCell,
} from '../components/columns'
import {
  AutoDiscoverCloudIds,
  AutoDiscoverCloudTitles,
} from '../constants/constants'

export const redisCloudDatabasesResultColumns: ColumnDef<InstanceRedisCloud>[] = [
  {
    header: AutoDiscoverCloudTitles.Database,
    id: AutoDiscoverCloudIds.Name,
    accessorKey: AutoDiscoverCloudIds.Name,
    enableSorting: true,
    maxSize: 120,
    cell: DatabaseCell,
  },
  {
    header: AutoDiscoverCloudTitles.SubscriptionId,
    id: AutoDiscoverCloudIds.SubscriptionId,
    accessorKey: AutoDiscoverCloudIds.SubscriptionId,
    enableSorting: true,
    maxSize: 150,
  },
  {
    header: AutoDiscoverCloudTitles.Subscription,
    id: AutoDiscoverCloudIds.SubscriptionName,
    accessorKey: AutoDiscoverCloudIds.SubscriptionName,
    enableSorting: true,
    maxSize: 270,
    cell: SubscriptionDbCell,
  },
  {
    header: AutoDiscoverCloudTitles.Type,
    id: AutoDiscoverCloudIds.SubscriptionType,
    accessorKey: AutoDiscoverCloudIds.SubscriptionType,
    enableSorting: true,
    size: 95,
  },
  {
    header: AutoDiscoverCloudTitles.Status,
    id: AutoDiscoverCloudIds.Status,
    accessorKey: AutoDiscoverCloudIds.Status,
    enableSorting: true,
    size: 80,
    cell: StatusResultCell,
  },
  {
    header: AutoDiscoverCloudTitles.Endpoint,
    id: AutoDiscoverCloudIds.PublicEndpoint,
    accessorKey: AutoDiscoverCloudIds.PublicEndpoint,
    enableSorting: true,
    minSize: 250,
    maxSize: 310,
    cell: EndpointCell,
  },
  {
    header: AutoDiscoverCloudTitles.Capabilities,
    id: AutoDiscoverCloudIds.Modules,
    accessorKey: AutoDiscoverCloudIds.Modules,
    enableSorting: true,
    maxSize: 150,
    cell: ModulesCell,
  },
  {
    header: AutoDiscoverCloudTitles.Options,
    id: AutoDiscoverCloudIds.Options,
    accessorKey: AutoDiscoverCloudIds.Options,
    enableSorting: true,
    maxSize: 180,
    cell: OptionsCell,
  },
  {
    header: AutoDiscoverCloudTitles.Result,
    id: AutoDiscoverCloudIds.MessageAdded,
    accessorKey: AutoDiscoverCloudIds.MessageAdded,
    enableSorting: true,
    minSize: 110,
    cell: MessageResultCell,
  },
]

