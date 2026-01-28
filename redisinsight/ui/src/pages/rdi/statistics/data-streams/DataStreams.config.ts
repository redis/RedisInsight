import { ColumnDef } from 'uiSrc/components/base/layout/table'
import { DataStreamsData } from './DataStreams.types'
import { LastArrivalCell, StreamNameCell } from './components'

const columns: ColumnDef<DataStreamsData>[] = [
  {
    header: 'Stream name',
    id: 'name',
    accessorKey: 'name',
    enableSorting: true,
    cell: StreamNameCell,
  },
  {
    header: 'Total',
    id: 'total',
    accessorKey: 'total',
    enableSorting: true,
    size: 100,
  },
  {
    header: 'Pending',
    id: 'pending',
    accessorKey: 'pending',
    enableSorting: true,
    size: 100,
  },
  {
    header: 'Inserted',
    id: 'inserted',
    accessorKey: 'inserted',
    enableSorting: true,
    size: 100,
  },
  {
    header: 'Updated',
    id: 'updated',
    accessorKey: 'updated',
    enableSorting: true,
    size: 100,
  },
  {
    header: 'Deleted',
    id: 'deleted',
    accessorKey: 'deleted',
    enableSorting: true,
    size: 100,
  },
  {
    header: 'Filtered',
    id: 'filtered',
    accessorKey: 'filtered',
    enableSorting: true,
    size: 100,
  },
  {
    header: 'Rejected',
    id: 'rejected',
    accessorKey: 'rejected',
    enableSorting: true,
    size: 100,
  },
  {
    header: 'Deduplicated',
    id: 'deduplicated',
    accessorKey: 'deduplicated',
    enableSorting: true,
    size: 100,
  },
  {
    header: 'Last arrival',
    id: 'lastArrival',
    accessorKey: 'lastArrival',
    enableSorting: true,
    cell: LastArrivalCell,
  },
]

export default columns
