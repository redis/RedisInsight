import React from 'react'

import {
  IConnections,
  StatisticsConnectionStatus,
} from 'uiSrc/slices/interfaces'
import { formatLongName } from 'uiSrc/utils'
import { ColumnDefinition, Table } from 'uiSrc/components/base/layout/table'
import { RiTooltip } from 'uiSrc/components'
import { Section } from '@redis-ui/components'
import {
  StyledRdiAnalyticsTable,
  StyledRdiStatisticsSectionBody,
} from 'uiSrc/pages/rdi/statistics/styles'
import { StatusIndicator } from 'uiSrc/components/base/text/text.styles'
import { Row } from 'uiSrc/components/base/layout/flex'

type ConnectionData = {
  name: string
  status: string
  type: string
  hostPort: string
  database: string
  user: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case StatisticsConnectionStatus.connected:
      return 'success'
    case StatisticsConnectionStatus.notYetUsed:
      return 'warning'
    default:
      return 'danger'
  }
}

const columns: ColumnDefinition<ConnectionData>[] = [
  {
    size: 30,
    header: 'Status',
    id: 'status',
    accessorKey: 'status',
    enableSorting: true,
    cell: ({
      row: {
        original: { status },
      },
    }) => (
      <Row align="center" justify="center">
        <RiTooltip content={status}>
          <StatusIndicator $color={getStatusColor(status)} />
        </RiTooltip>
      </Row>
    ),
  },
  {
    header: 'Name',
    id: 'name',
    accessorKey: 'name',
    enableSorting: true,
  },
  {
    header: 'Type',
    id: 'type',
    accessorKey: 'type',
    enableSorting: true,
  },
  {
    header: 'Host:port',
    id: 'hostPort',
    accessorKey: 'hostPort',
    enableSorting: true,
    cell: ({
      row: {
        original: { hostPort },
      },
    }) => (
      <RiTooltip content={hostPort}>
        <span>{formatLongName(hostPort, 80, 0, '...')}</span>
      </RiTooltip>
    ),
  },
  {
    header: 'Database',
    id: 'database',
    accessorKey: 'database',
    enableSorting: true,
  },
  {
    header: 'Username',
    id: 'user',
    accessorKey: 'user',
    enableSorting: true,
  },
]

interface Props {
  data: IConnections
}

const TargetConnections = ({ data }: Props) => {
  const connections: ConnectionData[] = Object.keys(data).map((key) => {
    const connection = data[key]
    return {
      name: key,
      hostPort: `${connection.host}:${connection.port}`,
      ...connection,
    }
  })

  return (
    <Section.Compose collapsible defaultOpen>
      <Section.Header label="Target connections" />
      <StyledRdiStatisticsSectionBody
        content={
          <StyledRdiAnalyticsTable
            columns={columns}
            data={connections}
            defaultSorting={[{ id: 'name', desc: false }]}
          >
            <Table.Header />
            <Table.Body />
          </StyledRdiAnalyticsTable>
        }
      />
    </Section.Compose>
  )
}

export default TargetConnections
