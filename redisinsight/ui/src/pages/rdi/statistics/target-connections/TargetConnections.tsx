import React from 'react'

import { StatisticsConnectionStatus } from 'uiSrc/slices/interfaces'
import { formatLongName } from 'uiSrc/utils'
import { ColumnDef, Table } from 'uiSrc/components/base/layout/table'
import { RiTooltip } from 'uiSrc/components'
import { Section } from 'uiSrc/components/base/display'
import {
  StyledRdiAnalyticsTable,
  StyledRdiStatisticsSectionBody,
} from 'uiSrc/pages/rdi/statistics/styles'
import * as S from 'uiSrc/components/base/text/text.styles'
import { Row } from 'uiSrc/components/base/layout/flex'
import {
  ConnectionData,
  TargetConnectionsProps,
} from './TargetConnections.types'

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

const columns: ColumnDef<ConnectionData>[] = [
  {
    size: 40,
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
          <S.Indicator $color={getStatusColor(status)} />
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

const TargetConnections = ({ data }: TargetConnectionsProps) => {
  const connections: ConnectionData[] = Object.keys(data).map((key) => {
    const connection = data[key]
    return {
      name: key,
      hostPort: `${connection.host}:${connection.port}`,
      ...connection,
    }
  })

  return (
    <Section.Compose collapsible defaultOpen id="target-connections">
      <Section.Header label="Target connections" />
      <StyledRdiStatisticsSectionBody>
        <StyledRdiAnalyticsTable
          columns={columns}
          data={connections}
          defaultSorting={[{ id: 'name', desc: false }]}
        >
          <Table.Header />
          <Table.Body />
        </StyledRdiAnalyticsTable>
      </StyledRdiStatisticsSectionBody>
    </Section.Compose>
  )
}

export default TargetConnections
