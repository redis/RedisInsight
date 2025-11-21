import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type RedisCloudSubscription } from 'uiSrc/slices/interfaces'

import { getSelectionColumn } from 'uiSrc/pages/autodiscover-cloud/utils'
import {
  AlertCell,
  SubscriptionCell,
  IdCell,
  TypeCell,
  ProviderCell,
  RegionCell,
  NumberOfDatabasesCell,
  StatusCell,
} from '../components/columns'
import {
  AutoDiscoverCloudIds,
  AutoDiscoverCloudTitles,
} from '../constants/constants'

export const redisCloudSubscriptionsColumns: ColumnDef<RedisCloudSubscription>[] =
  [
    getSelectionColumn<RedisCloudSubscription>({
      id: AutoDiscoverCloudIds.Selection,
    }),
    {
      id: AutoDiscoverCloudIds.Alert,
      accessorKey: AutoDiscoverCloudIds.Alert,
      header: '',
      enableResizing: false,
      enableSorting: false,
      size: 50,
      cell: AlertCell,
    },
    {
      id: AutoDiscoverCloudIds.Id,
      accessorKey: AutoDiscoverCloudIds.Id,
      header: AutoDiscoverCloudTitles.Id,
      enableSorting: true,
      size: 80,
      cell: IdCell,
    },
    {
      id: AutoDiscoverCloudIds.Name,
      accessorKey: AutoDiscoverCloudIds.Name,
      header: AutoDiscoverCloudTitles.Subscription,
      enableSorting: true,
      cell: SubscriptionCell,
    },
    {
      id: AutoDiscoverCloudIds.Type,
      accessorKey: AutoDiscoverCloudIds.Type,
      header: AutoDiscoverCloudTitles.Type,
      enableSorting: true,
      cell: TypeCell,
    },
    {
      id: AutoDiscoverCloudIds.Provider,
      accessorKey: AutoDiscoverCloudIds.Provider,
      header: AutoDiscoverCloudTitles.Provider,
      enableSorting: true,
      cell: ProviderCell,
    },
    {
      id: AutoDiscoverCloudIds.Region,
      accessorKey: AutoDiscoverCloudIds.Region,
      header: AutoDiscoverCloudTitles.Region,
      enableSorting: true,
      cell: RegionCell,
    },
    {
      id: AutoDiscoverCloudIds.NumberOfDatabases,
      accessorKey: AutoDiscoverCloudIds.NumberOfDatabases,
      header: AutoDiscoverCloudTitles.NumberOfDatabases,
      enableSorting: true,
      cell: NumberOfDatabasesCell,
    },
    {
      id: AutoDiscoverCloudIds.Status,
      accessorKey: AutoDiscoverCloudIds.Status,
      header: AutoDiscoverCloudTitles.Status,
      enableSorting: true,
      cell: StatusCell,
    },
  ]
