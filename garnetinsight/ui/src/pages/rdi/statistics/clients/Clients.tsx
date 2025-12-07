import React from 'react'

import { IClients } from 'uiSrc/slices/interfaces'
import { Table, ColumnDefinition } from 'uiSrc/components/base/layout/table'
import { Section } from '@redis-ui/components'
import {
  StyledRdiAnalyticsTable,
  StyledRdiStatisticsSectionBody,
} from 'uiSrc/pages/rdi/statistics/styles'

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
}

const Clients = ({ data }: Props) => {
  const clients: ClientsData[] = Object.keys(data).map((key) => {
    const client = data[key]
    return {
      id: key,
      ...client,
    }
  })

  return (
    <Section.Compose collapsible defaultOpen id="clients">
      <Section.Header label="Clients" />
      <StyledRdiStatisticsSectionBody
        content={
          <StyledRdiAnalyticsTable
            columns={columns}
            data={clients}
            defaultSorting={[{ id: 'id', desc: false }]}
          >
            <Table.Header />
            <Table.Body />
          </StyledRdiAnalyticsTable>
        }
      />
    </Section.Compose>
  )
}

export default Clients
