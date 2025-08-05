import cx from 'classnames'
import React, { useState } from 'react'

import { ImportDatabasesData } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { Nullable } from 'uiSrc/utils'
import { RiCollapsibleNavGroup } from 'uiSrc/components/base/display'
import { Col } from 'uiSrc/components/base/layout/flex'
import TableResult from '../TableResult'

import styles from './styles.module.scss'

enum ResultsStatus {
  Success = 'success',
  Partial = 'partial',
  Failed = 'failed',
}

export interface Props {
  data: Nullable<ImportDatabasesData>
}

const ResultsLog = ({ data }: Props) => {
  const [openedNav, setOpenedNav] = useState<string>('')

  const onToggle = (length: number = 0, isOpen: boolean, name: string) => {
    if (length === 0) return
    setOpenedNav(isOpen ? name : '')

    if (isOpen) {
      sendEventTelemetry({
        event: TelemetryEvent.CONFIG_DATABASES_REDIS_IMPORT_LOG_VIEWED,
        eventData: {
          length,
          name,
        },
      })
    }
  }

  const CollapsibleNavTitle = ({
    title,
    length = 0,
  }: {
    title: string
    length: number
  }) => (
    <div className={styles.collapsibleNavTitle}>
      <span data-testid="nav-group-title">{title}:</span>
      <span data-testid="number-of-dbs">{length}</span>
    </div>
  )

  const getNavGroupState = (name: ResultsStatus) =>
    openedNav === name ? 'open' : 'closed'

  return (
    <Col gap="s">
      <RiCollapsibleNavGroup
        title={
          <CollapsibleNavTitle
            title="Fully imported"
            length={data?.success?.length ?? 0}
          />
        }
        className={cx(styles.collapsibleNav, ResultsStatus.Success, {
          [styles.disabled]: !data?.success?.length,
        })}
        isCollapsible
        initialIsOpen={false}
        onToggle={(isOpen) =>
          onToggle(data?.success?.length, isOpen, ResultsStatus.Success)
        }
        forceState={getNavGroupState(ResultsStatus.Success)}
        data-testid={`success-results-${getNavGroupState(ResultsStatus.Success)}`}
      >
        <TableResult data={data?.success ?? []} />
      </RiCollapsibleNavGroup>
      <RiCollapsibleNavGroup
        title={
          <CollapsibleNavTitle
            title="Partially imported"
            length={data?.partial?.length ?? 0}
          />
        }
        className={cx(styles.collapsibleNav, ResultsStatus.Partial, {
          [styles.disabled]: !data?.partial?.length,
        })}
        isCollapsible
        initialIsOpen={false}
        onToggle={(isOpen) =>
          onToggle(data?.partial?.length, isOpen, ResultsStatus.Partial)
        }
        forceState={getNavGroupState(ResultsStatus.Partial)}
        data-testid={`partial-results-${getNavGroupState(ResultsStatus.Partial)}`}
      >
        <TableResult data={data?.partial ?? []} />
      </RiCollapsibleNavGroup>
      <RiCollapsibleNavGroup
        title={
          <CollapsibleNavTitle
            title="Failed to import"
            length={data?.fail?.length ?? 0}
          />
        }
        className={cx(styles.collapsibleNav, ResultsStatus.Failed, {
          [styles.disabled]: !data?.fail?.length,
        })}
        isCollapsible
        initialIsOpen={false}
        onToggle={(isOpen) =>
          onToggle(data?.fail?.length, isOpen, ResultsStatus.Failed)
        }
        forceState={getNavGroupState(ResultsStatus.Failed)}
        data-testid={`failed-results-${getNavGroupState(ResultsStatus.Failed)}`}
      >
        <TableResult data={data?.fail ?? []} />
      </RiCollapsibleNavGroup>
    </Col>
  )
}

export default ResultsLog
