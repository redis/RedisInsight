import React from 'react'
import { useParams } from 'react-router-dom'
import { DURATION_UNITS, DurationUnits, SortOrder } from 'uiSrc/constants'
import { convertNumberByUnits } from 'uiSrc/pages/slow-log/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { Text } from 'uiSrc/components/base/text'
import {
  Table,
  ColumnDef,
  SortingState,
} from 'uiSrc/components/base/layout/table'

import { FormatedDate, RiTooltip } from 'uiSrc/components'

import { SlowLog } from 'apiSrc/modules/slow-log/models'
import { StyledTableWrapper } from './SlowLogTable.styles'

export const DATE_FORMAT = 'HH:mm:ss d LLL yyyy'

export interface Props {
  items: SlowLog[]
  loading: boolean
  durationUnit: DurationUnits
}

const SlowLogTable = (props: Props) => {
  const { items = [], durationUnit } = props

  const { instanceId } = useParams<{ instanceId: string }>()

  const columns: ColumnDef<SlowLog>[] = [
    {
      id: 'time',
      header: 'Timestamp',
      accessorKey: 'time',
      size: 15,
      cell: ({ getValue }) => {
        const date = (getValue() as number) * 1000

        return <FormatedDate date={date} />
      },
    },
    {
      id: 'durationUs',
      header: `Duration, ${DURATION_UNITS.find(({ value }) => value === durationUnit)?.inputDisplay}`,
      accessorKey: 'durationUs',
      size: 15,
      cell: ({ getValue }) => {
        const duration = getValue() as number

        return (
          <Text size="s" data-testid="duration-value">
            {numberWithSpaces(convertNumberByUnits(duration, durationUnit))}
          </Text>
        )
      },
    },
    {
      id: 'args',
      header: 'Command',
      accessorKey: 'args',
      cell: ({ getValue }) => {
        const command = getValue() as string

        return (
          <RiTooltip position="bottom" content={command}>
            <span data-testid="command-value">{command}</span>
          </RiTooltip>
        )
      },
    },
  ]

  const handleSortingChange = (state: SortingState) => {
    const { desc } = state[0] || { desc: true }
    const order = desc ? SortOrder.DESC : SortOrder.ASC

    sendEventTelemetry({
      event: TelemetryEvent.SLOWLOG_SORTED,
      eventData: {
        databaseId: instanceId,
        timestamp: order,
      },
    })
  }

  return (
    <StyledTableWrapper data-testid="slowlog-table">
      <Table
        columns={columns}
        data={items}
        onSortingChange={handleSortingChange}
        maxHeight="60vh"
        stripedRows
      />
    </StyledTableWrapper>
  )
}

export default SlowLogTable
