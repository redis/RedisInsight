import React, { useEffect, useState } from 'react'

import { ImportDatabasesData } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { Nullable } from 'uiSrc/utils'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import TableResult from '../TableResult'

import { ImportDatabaseResultType } from 'uiSrc/constants'
import { DataImportResult } from '../TableResult/TableResult'
import { StyledCollapsibleNavGroup } from './ResultLog.styles'

interface Props {
  data: Nullable<ImportDatabasesData>
}

interface TableResultData {
  type: ImportDatabaseResultType
  title: string
  data: DataImportResult[]
}

const ResultsLog = ({ data }: Props) => {
  const [openedNav, setOpenedNav] =
    useState<Nullable<ImportDatabaseResultType>>(null)

  useEffect(() => {
    if (openedNav) {
      sendEventTelemetry({
        event: TelemetryEvent.CONFIG_DATABASES_REDIS_IMPORT_LOG_VIEWED,
        eventData: {
          length:
            collapsibleNavData.find((item) => item.type === openedNav)?.data
              .length ?? 0,
          name: openedNav,
        },
      })
    }
  }, [openedNav])

  const collapsibleNavData: TableResultData[] = [
    {
      type: ImportDatabaseResultType.Success,
      title: 'Fully imported',
      data: data?.success ?? [],
    },
    {
      type: ImportDatabaseResultType.Partial,
      title: 'Partially imported',
      data: data?.partial ?? [],
    },
    {
      type: ImportDatabaseResultType.Failed,
      title: 'Failed to import',
      data: data?.fail ?? [],
    },
  ]

  const CollapsibleNavTitle = ({
    title,
    length = 0,
  }: {
    title: string
    length: number
  }) => (
    <Row gap="s">
      <Text data-testid="nav-group-title">{title}:</Text>
      <Text data-testid="number-of-dbs">{length}</Text>
    </Row>
  )

  const getNavGroupState = (type: ImportDatabaseResultType) =>
    openedNav === type ? 'open' : 'closed'

  return (
    <Col gap="l">
      {collapsibleNavData.map((item) => (
        <StyledCollapsibleNavGroup
          key={item.type}
          title={
            <CollapsibleNavTitle title={item.title} length={item.data.length} />
          }
          data-testid={`${item.type}-results-${getNavGroupState(item.type)}`}
          id={`${item.type}-results-${getNavGroupState(item.type)}`}
          initialIsOpen={false}
          onToggle={(isOpen) => setOpenedNav(isOpen ? item.type : null)}
          forceState={getNavGroupState(item.type)}
          open={openedNav === item.type}
        >
          <TableResult data={item.data} />
        </StyledCollapsibleNavGroup>
      ))}
    </Col>
  )
}

export default ResultsLog
