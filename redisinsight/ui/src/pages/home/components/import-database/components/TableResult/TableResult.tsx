import React from 'react'
import { RiTable, ColumnDefinition } from 'uiSrc/components/base/layout'

import { ErrorImportResult } from 'uiSrc/slices/interfaces'

import styles from './styles.module.scss'

export interface DataImportResult {
  index: number
  status: string
  errors?: Array<ErrorImportResult>
  host?: string
  port?: number
}
export interface Props {
  data: Array<DataImportResult>
}

const TableResult = (props: Props) => {
  const { data } = props

  const ErrorResult = ({ errors }: { errors: string[] }) => (
    <ul>
      {errors.map((message, i) => (
        <li key={String(Math.random() * i)}>{message}</li>
      ))}
    </ul>
  )

  const columns: ColumnDefinition<DataImportResult>[] = [
    {
      header: '#',
      id: 'index',
      accessorKey: 'index',
      cell: ({
        row: {
          original: { index },
        },
      }) => <span data-testid={`table-index-${index}`}>({index})</span>,
    },
    {
      header: 'Host:Port',
      id: 'host',
      accessorKey: 'host',
      cell: ({
        row: {
          original: { host, port, index },
        },
      }) => (
        <div data-testid={`table-host-port-${index}`}>
          {host}:{port}
        </div>
      ),
    },
    {
      header: 'Result',
      id: 'errors',
      accessorKey: 'errors',
      cell: ({
        row: {
          original: { errors, index },
        },
      }) => (
        <div data-testid={`table-result-${index}`}>
          {errors ? (
            <ErrorResult errors={errors.map((e) => e.message)} />
          ) : (
            'Successful'
          )}
        </div>
      ),
    },
  ]

  if (data?.length === 0) return null

  return (
    <div className={styles.tableWrapper}>
      <RiTable columns={columns} data={data} defaultSorting={[]} />
    </div>
  )
}

export default TableResult
