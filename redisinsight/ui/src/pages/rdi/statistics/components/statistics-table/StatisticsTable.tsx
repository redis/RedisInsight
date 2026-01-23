import React, { useMemo } from 'react'

import { Table } from 'uiSrc/components/base/layout/table'
import { Section } from '@redis-ui/components'
import { IStatisticsTableSection } from 'uiSrc/slices/interfaces'
import useStatisticsTableColumns from './hooks/useStatisticsTableColumns'

import * as S from './StatisticsTable.styles'

interface Props {
  data: IStatisticsTableSection
}

const StatisticsTable = ({ data }: Props) => {
  const { name, columns, data: tableData, footer } = data

  const tableColumns = useStatisticsTableColumns(columns)

  const dataWithFooter = useMemo(
    () => (footer ? [...tableData, footer] : tableData),
    [tableData, footer],
  )

  return (
    <Section.Compose collapsible defaultOpen id={name.toLowerCase()}>
      <Section.Header label={name} />
      <S.SectionBody
        content={
          <S.StatisticsTable columns={tableColumns} data={dataWithFooter}>
            <Table.Header />
            <Table.Body />
          </S.StatisticsTable>
        }
      />
    </Section.Compose>
  )
}

export default StatisticsTable
