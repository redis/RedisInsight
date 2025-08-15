import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { RiText } from 'uiBase/text'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import VirtualTable from 'uiSrc/components/virtual-table/VirtualTable'
import {
  DURATION_UNITS,
  DurationUnits,
  SortOrder,
  TableCellAlignment,
  TableCellTextAlignment,
} from 'uiSrc/constants'
import { convertNumberByUnits } from 'uiSrc/pages/slow-log/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { numberWithSpaces } from 'uiSrc/utils/numbers'

import { FormatedDate } from 'uiSrc/components'
import styles from '../styles.module.scss'
import { RiTooltip } from 'uiBase/tooltip'

export const DATE_FORMAT = 'HH:mm:ss d LLL yyyy'

export interface Props {
  items: any
  loading: boolean
  durationUnit: DurationUnits
}

const sortByTimeStamp = (items = [], order: SortOrder) =>
  [...items].sort((a: any, b: any) =>
    order === SortOrder.DESC ? b.time - a.time : a.time - b.time,
  )

const SlowLogTable = (props: Props) => {
  const { items = [], loading = false, durationUnit } = props
  const [table, setTable] = useState<any>([])
  const [sortedColumnName, setSortedColumnName] = useState('time')
  const [sortedColumnOrder, setSortedColumnOrder] = useState(SortOrder.DESC)

  const { instanceId } = useParams<{ instanceId: string }>()
  const sortedColumn = {
    column: sortedColumnName,
    order: sortedColumnOrder,
  }

  useEffect(() => {
    setTable(sortByTimeStamp(items, sortedColumnOrder))
  }, [items, sortedColumnOrder])

  const columns: ITableColumn[] = [
    {
      id: 'time',
      label: 'Timestamp',
      absoluteWidth: 190,
      minWidth: 190,
      isSortable: true,
      render: (timestamp) => (
        <RiText
          size="s"
          color="subdued"
          data-testid="timestamp-value"
          className={styles.timestampCell}
        >
          <FormatedDate date={timestamp * 1000} />
        </RiText>
      ),
    },
    {
      id: 'durationUs',
      label: `Duration, ${DURATION_UNITS.find(({ value }) => value === durationUnit)?.inputDisplay}`,
      minWidth: 110,
      absoluteWidth: 'auto',
      textAlignment: TableCellTextAlignment.Right,
      alignment: TableCellAlignment.Right,
      render: (duration) => (
        <RiText size="s" color="subdued" data-testid="duration-value">
          {numberWithSpaces(convertNumberByUnits(duration, durationUnit))}
        </RiText>
      ),
    },
    {
      id: 'args',
      label: 'Command',
      render: (command) => (
        <RiTooltip
          position="bottom"
          content={command}
          anchorClassName={styles.commandTooltip}
        >
          <span className={styles.commandText} data-testid="command-value">
            {command}
          </span>
        </RiTooltip>
      ),
    },
  ]

  const onChangeSorting = (column: any, order: SortOrder) => {
    setSortedColumnName(column)
    setSortedColumnOrder(order)
    sendEventTelemetry({
      event: TelemetryEvent.SLOWLOG_SORTED,
      eventData: {
        databaseId: instanceId,
        timestamp: order,
      },
    })
  }

  return (
    <div className={styles.tableWrapper} data-testid="slowlog-table">
      <VirtualTable
        selectable={false}
        loading={loading}
        items={table}
        columns={columns}
        sortedColumn={sortedColumn}
        onChangeSorting={onChangeSorting}
        hideFooter
      />
    </div>
  )
}

export default SlowLogTable
