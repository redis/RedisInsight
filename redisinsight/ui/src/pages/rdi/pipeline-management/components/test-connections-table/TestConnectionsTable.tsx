import React from 'react'
import styled from 'styled-components'
import { Table, ColumnDefinition } from 'uiSrc/components/base/layout/table'

import { IRdiConnectionResult } from 'uiSrc/slices/interfaces'

import styles from './styles.module.scss'

const PreWrapText = styled.div<React.HTMLAttributes<HTMLDivElement>>`
  white-space: pre-wrap;
`

export interface Props {
  data: Array<IRdiConnectionResult>
}

const TestConnectionsTable = (props: Props) => {
  const { data } = props

  const columns: ColumnDefinition<IRdiConnectionResult>[] = [
    {
      header: 'Name',
      id: 'target',
      accessorKey: 'target',
      cell: ({
        row: {
          original: { target },
        },
      }) => <div data-testid={`table-target-${target}`}>{target}</div>,
    },
    {
      header: 'Result',
      id: 'error',
      accessorKey: 'error',
      cell: ({
        row: {
          original: { target, error },
        },
      }) => (
        <PreWrapText data-testid={`table-result-${target}`}>
          {error || 'Successful'}
        </PreWrapText>
      ),
    },
  ]

  if (data?.length === 0) return null

  return (
    <div className={styles.tableWrapper}>
      <Table
        columns={columns}
        data={data ?? []}
        defaultSorting={[]}
        data-testid="connections-log-table"
      />
    </div>
  )
}

export default TestConnectionsTable
