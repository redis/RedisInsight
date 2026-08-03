import React from 'react'

import { Table, ColumnDef } from 'uiSrc/components/base/layout/table'
import {
  ImportTableResultColumn,
  TABLE_IMPORT_RESULT_COLUMN_ID_HEADER_MAP,
} from 'uiSrc/constants'
import { ErrorImportResult } from 'uiSrc/slices/interfaces'
import { useTranslation } from 'uiSrc/i18n'

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
  const { t } = useTranslation()
  const { data } = props

  const ErrorResult = ({ errors }: { errors: string[] }) => (
    <ul>
      {errors.map((message, i) => (
        <li key={String(Math.random() * i)}>{message}</li>
      ))}
    </ul>
  )

  const columns: ColumnDef<DataImportResult>[] = [
    {
      header: TABLE_IMPORT_RESULT_COLUMN_ID_HEADER_MAP.get(
        ImportTableResultColumn.Index,
      ),
      id: ImportTableResultColumn.Index,
      accessorKey: ImportTableResultColumn.Index,
      cell: ({
        row: {
          original: { index },
        },
      }) => <span data-testid={`table-index-${index}`}>({index})</span>,
      size: 50,
    },
    {
      header: TABLE_IMPORT_RESULT_COLUMN_ID_HEADER_MAP.get(
        ImportTableResultColumn.Host,
      ),
      id: ImportTableResultColumn.Host,
      accessorKey: ImportTableResultColumn.Host,
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
      header: TABLE_IMPORT_RESULT_COLUMN_ID_HEADER_MAP.get(
        ImportTableResultColumn.Errors,
      ),
      id: ImportTableResultColumn.Errors,
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
            t('home.importDatabase.table.successful')
          )}
        </div>
      ),
    },
  ]

  if (data?.length === 0) return null

  return (
    <Table
      columns={columns}
      data={data}
      defaultSorting={[]}
      maxHeight="20rem"
    />
  )
}

export default TableResult
