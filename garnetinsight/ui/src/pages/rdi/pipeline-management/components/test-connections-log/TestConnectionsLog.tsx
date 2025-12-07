import React from 'react'
import {
  IRdiConnectionResult,
  TransformGroupResult,
} from 'uiSrc/slices/interfaces'
import { StyledRdiAnalyticsTable } from 'uiSrc/pages/rdi/statistics/styles'
import { ColumnDefinition, Table } from 'uiSrc/components/base/layout/table'
import { RiTooltip } from 'uiSrc/components'

const columns: ColumnDefinition<IRdiConnectionResult>[] = [
  {
    header: 'Endpoint',
    id: 'endpoint',
    accessorKey: 'target',
  },
  {
    header: 'Results',
    id: 'results',
    accessorKey: 'error',
    cell: ({
      row: {
        original: { error: error },
      },
    }) => {
      if (error) {
        return <RiTooltip content={error}>{error}</RiTooltip>
      }
      return 'Successful'
    },
  },
]

export interface Props {
  data: TransformGroupResult
}

const TestConnectionsLog = (props: Props) => {
  const { data } = props
  const statusData = [...data.success, ...data.fail]

  return (
    <>
      <StyledRdiAnalyticsTable columns={columns} data={statusData} stripedRows>
        <Table.Root></Table.Root>
        <Table.Header />
        <Table.Body />
      </StyledRdiAnalyticsTable>
    </>
  )
}

export default TestConnectionsLog
