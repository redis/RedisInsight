import React, { useMemo } from 'react'
import { TFunction } from 'i18next'
import {
  IRdiConnectionResult,
  TransformGroupResult,
} from 'uiSrc/slices/interfaces'
import { StyledRdiAnalyticsTable } from 'uiSrc/pages/rdi/statistics/styles'
import { ColumnDefinition, Table } from 'uiSrc/components/base/layout/table'
import { RiTooltip } from 'uiSrc/components'
import { useTranslation } from 'uiSrc/i18n'

const getColumns = (t: TFunction): ColumnDefinition<IRdiConnectionResult>[] => [
  {
    header: t('rdi.pipeline.testConn.colEndpoint'),
    id: 'endpoint',
    accessorKey: 'target',
  },
  {
    header: t('rdi.pipeline.testConn.colResults'),
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
      return t('rdi.pipeline.testConn.successful')
    },
  },
]

export interface Props {
  data: TransformGroupResult
}

const TestConnectionsLog = (props: Props) => {
  const { t } = useTranslation()
  const { data } = props
  const statusData = [...data.success, ...data.fail]
  const columns = useMemo(() => getColumns(t), [t])

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
