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
      header: ({ table }) => `${table.options.data.length} Primary nodes`,
      isHeaderCustom: true,
      id: 'host',
      accessorKey: 'host',
      enableSorting: true,
      cell: ClusterNodesHostCell,
    },
    {
      header: 'Commands/s',
      id: 'opsPerSecond',
      accessorKey: 'opsPerSecond',
      enableSorting: true,
      cell: ClusterNodesNumericCell,
    },
    {
      header: 'Network Input',
      id: 'networkInKbps',
      accessorKey: 'networkInKbps',
      enableSorting: true,
      cell: ClusterNodesNumericCell,
    },
    {
      header: 'Network Output',
      id: 'networkOutKbps',
      accessorKey: 'networkOutKbps',
      enableSorting: true,
      cell: ClusterNodesNumericCell,
    },
    {
      header: 'Total Memory',
      id: 'usedMemory',
      accessorKey: 'usedMemory',
      enableSorting: true,
      cell: ClusterNodesNumericCell,
    },
    {
      header: 'Total Keys',
      id: 'totalKeys',
      accessorKey: 'totalKeys',
      enableSorting: true,
      cell: ClusterNodesNumericCell,
    },
    {
      header: 'Clients',
      id: 'connectedClients',
      accessorKey: 'connectedClients',
      enableSorting: true,
      cell: ClusterNodesNumericCell,
    },
  ]
