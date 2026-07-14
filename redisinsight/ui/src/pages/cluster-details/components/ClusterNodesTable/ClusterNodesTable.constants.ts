import i18n from 'uiSrc/i18n'
import { ColumnDef, SortingState } from 'uiSrc/components/base/layout/table'

import { ModifiedClusterNodes } from '../../ClusterDetailsPage'
import { ClusterNodesHostCell } from './components/ClusterNodesHostCell/ClusterNodesHostCell'
import { ClusterNodesNumericCell } from './components/ClusterNodesNumericCell/ClusterNodesNumericCell'

export const DEFAULT_SORTING: SortingState = [
  {
    id: 'host',
    desc: false,
  },
]

export const DEFAULT_CLUSTER_NODES_COLUMNS: ColumnDef<ModifiedClusterNodes>[] =
  [
    {
      header: ({ table }) =>
        i18n.t('analytics.clusterDetails.table.primaryNodes', {
          count: table.options.data.length,
        }),
      isHeaderCustom: true,
      id: 'host',
      accessorKey: 'host',
      enableSorting: true,
      cell: ClusterNodesHostCell,
    },
    {
      header: () => i18n.t('analytics.clusterDetails.table.commandsPerSec'),
      id: 'opsPerSecond',
      accessorKey: 'opsPerSecond',
      enableSorting: true,
      cell: ClusterNodesNumericCell,
    },
    {
      header: () => i18n.t('analytics.clusterDetails.table.networkInput'),
      id: 'networkInKbps',
      accessorKey: 'networkInKbps',
      enableSorting: true,
      cell: ClusterNodesNumericCell,
    },
    {
      header: () => i18n.t('analytics.clusterDetails.table.networkOutput'),
      id: 'networkOutKbps',
      accessorKey: 'networkOutKbps',
      enableSorting: true,
      cell: ClusterNodesNumericCell,
    },
    {
      header: () => i18n.t('analytics.clusterDetails.table.totalMemory'),
      id: 'usedMemory',
      accessorKey: 'usedMemory',
      enableSorting: true,
      cell: ClusterNodesNumericCell,
    },
    {
      header: () => i18n.t('analytics.clusterDetails.table.totalKeys'),
      id: 'totalKeys',
      accessorKey: 'totalKeys',
      enableSorting: true,
      cell: ClusterNodesNumericCell,
    },
    {
      header: () => i18n.t('analytics.clusterDetails.table.clients'),
      id: 'connectedClients',
      accessorKey: 'connectedClients',
      enableSorting: true,
      cell: ClusterNodesNumericCell,
    },
  ]
