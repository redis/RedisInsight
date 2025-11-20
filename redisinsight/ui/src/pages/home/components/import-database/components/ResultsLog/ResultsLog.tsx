import React, { useEffect, useMemo, useState } from 'react'

import { ImportDatabasesData } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { Nullable } from 'uiSrc/utils'
import { Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { RICollapsibleNavGroup } from 'uiSrc/components/base/display'
import { ImportDatabaseResultType } from 'uiSrc/constants'

import TableResult from '../TableResult'
import { StyledColWrapper } from './ResultLog.styles'
import { RESULTS_DATA_CONFIG } from './ResultsLog.config'

interface Props {
  data: Nullable<ImportDatabasesData>
}

export interface TableResultData {
  type: ImportDatabaseResultType
  title: string
}

const ResultsLog = ({ data }: Props) => {
  const [openedNav, setOpenedNav] =
    useState<Nullable<ImportDatabaseResultType>>(null)

  const resultsData: TableResultData[] = useMemo(() => {
    return RESULTS_DATA_CONFIG.filter(
      (item) => data && data[item.type] && data[item.type].length > 0,
    )
  }, [data])

  useEffect(() => {
    if (openedNav) {
      sendEventTelemetry({
        event: TelemetryEvent.CONFIG_DATABASES_REDIS_IMPORT_LOG_VIEWED,
        eventData: {
          length: data?.[openedNav]?.length ?? 0,
          name: openedNav,
        },
      })
    }
  }, [openedNav])

  return (
    <StyledColWrapper gap="l">
      {resultsData.map((item) => {
        const navState = openedNav === item.type ? 'open' : 'closed'
        return (
          <RICollapsibleNavGroup
            key={item.type}
            title={
              <Row gap="s">
                <Text data-testid="nav-group-title">{item.title}:</Text>
                <Text data-testid="number-of-dbs">
                  {data?.[item.type]?.length ?? 0}
                </Text>
              </Row>
            }
            data-testid={`${item.type}-results-${navState}`}
            id={`${item.type}-results-${navState}`}
            initialIsOpen={false}
            onToggle={(isOpen) => setOpenedNav(isOpen ? item.type : null)}
            forceState={navState}
            open={openedNav === item.type}
          >
            <TableResult data={data?.[item.type] ?? []} />
          </RICollapsibleNavGroup>
        )
      })}
    </StyledColWrapper>
  )
}

export default ResultsLog
