import React from 'react'

import { IClients } from 'uiSrc/slices/interfaces'
import { RiTable, ColumnDefinition } from 'uiSrc/components/base/layout'
import Accordion from '../components/accordion'
import Panel from '../components/panel'

type ClientsData = {
  id: string
  addr: string
  name: string
  ageSec: number
  idleSec: number
  user: string
}

const columns: ColumnDefinition<ClientsData>[] = [
  {
    header: 'ID',
    id: 'id',
    accessorKey: 'id',
    enableSorting: true,
  },
  {
    header: 'ADDR',
    id: 'addr',
    accessorKey: 'addr',
    enableSorting: true,
  },
  {
    header: 'Age',
    id: 'ageSec',
    accessorKey: 'ageSec',
    enableSorting: true,
  },
  {
    header: 'Name',
    id: 'name',
    accessorKey: 'name',
    enableSorting: true,
  },
  {
    header: 'Idle',
    id: 'idleSec',
    accessorKey: 'idleSec',
    enableSorting: true,
  },
  {
    header: 'User',
    id: 'user',
    accessorKey: 'user',
    enableSorting: true,
  },
]

interface Props {
  data: IClients
  loading: boolean
  onRefresh: () => void
  onRefreshClicked: () => void
  onChangeAutoRefresh: (enableAutoRefresh: boolean, refreshRate: string) => void
}

const Clients = ({
  data,
  loading,
  onRefresh,
  onRefreshClicked,
  onChangeAutoRefresh,
}: Props) => {
  const clients: ClientsData[] = Object.keys(data).map((key) => {
    const client = data[key]
    return {
      id: key,
      ...client,
    }
  })

  return (
    <Panel>
      <Accordion
        id="clients"
        title="Clients"
        hideAutoRefresh
        loading={loading}
        onRefresh={onRefresh}
        onRefreshClicked={onRefreshClicked}
        onChangeAutoRefresh={onChangeAutoRefresh}
      >
        <RiTable
          columns={columns}
          data={clients}
          defaultSorting={[{ id: 'id', desc: false }]}
        />
      </Accordion>
    </Panel>
  )
}

export default Clients
