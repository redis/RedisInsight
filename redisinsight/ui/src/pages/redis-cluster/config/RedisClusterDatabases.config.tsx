import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCluster } from 'uiSrc/slices/interfaces'

import {
  DatabaseCell,
  EndpointCell,
  CapabilitiesCell,
  OptionsCell,
  ResultCell,
} from '../components/columns'
import { RedisClusterIds, RedisClusterTitles } from '../constants/constants'
import { selectionColumn } from 'uiSrc/components/base/layout/table/columns/selection'

export const redisClusterDatabasesColumns: ColumnDef<InstanceRedisCluster>[] = [
  { ...selectionColumn, id: RedisClusterIds.Selection },
  {
    header: RedisClusterTitles.Database,
    id: RedisClusterIds.Name,
    accessorKey: RedisClusterIds.Name,
    minSize: 180,
    enableSorting: true,
    cell: DatabaseCell,
  },
  {
    header: RedisClusterTitles.Status,
    id: RedisClusterIds.Status,
    accessorKey: RedisClusterIds.Status,
    enableSorting: true,
    size: 100,
  },
  {
    header: RedisClusterTitles.Endpoint,
    id: RedisClusterIds.Endpoint,
    accessorKey: RedisClusterIds.Endpoint,
    enableSorting: true,
    cell: EndpointCell,
  },
  {
    header: RedisClusterTitles.Capabilities,
    id: RedisClusterIds.Capabilities,
    accessorKey: RedisClusterIds.Capabilities,
    enableSorting: true,
    maxSize: 150,
    cell: CapabilitiesCell,
  },
  {
    header: RedisClusterTitles.Options,
    id: RedisClusterIds.Options,
    accessorKey: RedisClusterIds.Options,
    enableSorting: true,
    maxSize: 180,
    cell: OptionsCell,
  },
  {
    header: RedisClusterTitles.Result,
    id: RedisClusterIds.Result,
    accessorKey: RedisClusterIds.Result,
    enableSorting: true,
    cell: ResultCell,
  },
]
