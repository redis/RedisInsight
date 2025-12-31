import React, { useMemo } from 'react'

import { ColumnDef } from 'uiSrc/components/base/layout/table'
import { FormatedDate, RiTooltip } from 'uiSrc/components'
import { Row } from 'uiSrc/components/base/layout/flex'
import { Indicator } from 'uiSrc/components/base/text/text.styles'
import { formatLongName } from 'uiSrc/utils'
import {
  IStatisticsColumn,
  StatisticsCellType,
  StatisticsConnectionStatus,
} from 'uiSrc/slices/interfaces'

const MAX_LENGTH = 30

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

const useStatisticsTableColumns = (
  columns: IStatisticsColumn[],
): ColumnDef<Record<string, unknown>>[] =>
  useMemo(
    () =>
      columns.map((column) => {
        const baseColumn: ColumnDef<Record<string, unknown>> = {
          header: column.header,
          id: column.id,
          accessorKey: column.id,
        }

        if (column.type === StatisticsCellType.Status) {
          return {
            ...baseColumn,
            size: 40,
            cell: ({ row: { original } }) => {
              const status = original[column.id] as string
              return (
                <Row align="center" justify="center">
                  <RiTooltip content={status}>
                    <Indicator $color={getStatusColor(status)} />
                  </RiTooltip>
                </Row>
              )
            },
          }
        }

        if (column.type === StatisticsCellType.Date) {
          return {
            ...baseColumn,
            cell: ({ row: { original } }) => {
              const value = original[column.id] as string
              return <FormatedDate date={value} />
            },
          }
        }

        return {
          ...baseColumn,
          cell: ({ row: { original } }) => {
            const value = original[column.id]
            const stringValue = String(value ?? '')

            if (stringValue.length > MAX_LENGTH) {
              return (
                <RiTooltip content={stringValue}>
                  {formatLongName(stringValue, MAX_LENGTH, 0, '...')}
                </RiTooltip>
              )
            }

            return stringValue
          },
        }
      }),
    [columns],
  )

export default useStatisticsTableColumns

