import React from 'react'

import { RiTable, ColumnDefinition } from 'uiBase/layout'
import { IDataStreams } from 'uiSrc/slices/interfaces'
import { formatLongName } from 'uiSrc/utils'
import { FormatedDate, RiTooltip } from 'uiSrc/components'
import Accordion from '../components/accordion'
import Panel from '../components/panel'

type DataStreamsData = {
  name: string
  total: number
  pending: number
  inserted: number
  updated: number
  deleted: number
  filtered: number
  rejected: number
  deduplicated: number
  lastArrival?: string
}

interface Props {
  data: IDataStreams
  loading: boolean
  onRefresh: () => void
  onRefreshClicked: () => void
  onChangeAutoRefresh: (enableAutoRefresh: boolean, refreshRate: string) => void
}

const columns: ColumnDefinition<DataStreamsData>[] = [
  {
    header: 'Stream name',
    id: 'name',
    accessorKey: 'name',
    enableSorting: true,
    cell: ({ getValue }) => (
      <RiTooltip content={getValue<string>()}>
        <span>{formatLongName(getValue<string>(), 30, 0, '...')}</span>
      </RiTooltip>
    ),
  },
  {
    header: 'Total',
    id: 'total',
    accessorKey: 'total',
    enableSorting: true,
  },
  {
    header: 'Pending',
    id: 'pending',
    accessorKey: 'pending',
    enableSorting: true,
  },
  {
    header: 'Inserted',
    id: 'inserted',
    accessorKey: 'inserted',
    enableSorting: true,
  },
  {
    header: 'Updated',
    id: 'updated',
    accessorKey: 'updated',
    enableSorting: true,
  },
  {
    header: 'Deleted',
    id: 'deleted',
    accessorKey: 'deleted',
    enableSorting: true,
  },
  {
    header: 'Filtered',
    id: 'filtered',
    accessorKey: 'filtered',
    enableSorting: true,
  },
  {
    header: 'Rejected',
    id: 'rejected',
    accessorKey: 'rejected',
    enableSorting: true,
  },
  {
    header: 'Deduplicated',
    id: 'deduplicated',
    accessorKey: 'deduplicated',
    enableSorting: true,
  },
  {
    header: 'Last arrival',
    id: 'lastArrival',
    accessorKey: 'lastArrival',
    enableSorting: true,
    cell: ({ getValue }) => <FormatedDate date={getValue<string>()} />,
  },
]

const DataStreams = ({
  data,
  loading,
  onRefresh,
  onRefreshClicked,
  onChangeAutoRefresh,
}: Props) => {
  const dataStreams: DataStreamsData[] = Object.keys(data?.streams || {}).map(
    (key) => {
      const dataStream = data.streams[key]
      return {
        name: key,
        ...dataStream,
      }
    },
  )

  const totalsRow: DataStreamsData = {
    name: 'Total',
    total: data?.totals?.total || 0,
    pending: data?.totals?.pending || 0,
    inserted: data?.totals?.inserted || 0,
    updated: data?.totals?.updated || 0,
    deleted: data?.totals?.deleted || 0,
    filtered: data?.totals?.filtered || 0,
    rejected: data?.totals?.rejected || 0,
    deduplicated: data?.totals?.deduplicated || 0,
    lastArrival: '',
  }

  return (
    <Panel>
      <Accordion
        id="data-streams"
        title="Data streams overview"
        hideAutoRefresh
        loading={loading}
        onRefresh={onRefresh}
        onRefreshClicked={onRefreshClicked}
        onChangeAutoRefresh={onChangeAutoRefresh}
      >
        <RiTable
          columns={columns}
          data={[...dataStreams, totalsRow]}
          defaultSorting={[{ id: 'name', desc: false }]}
        />
      </Accordion>
    </Panel>
  )
}

export default DataStreams
