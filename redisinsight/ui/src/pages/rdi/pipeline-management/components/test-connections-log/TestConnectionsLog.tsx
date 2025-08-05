import cx from 'classnames'
import React, { useState } from 'react'

import { RiCollapsibleNavGroup } from 'uiSrc/components/base/display'
import { TransformGroupResult } from 'uiSrc/slices/interfaces'
import TestConnectionsTable from 'uiSrc/pages/rdi/pipeline-management/components/test-connections-table'

import styles from './styles.module.scss'

enum ResultsStatus {
  Success = 'success',
  Failed = 'failed',
  Mixed = 'mixed',
}

export interface Props {
  data: TransformGroupResult
}

const getStatus = (data: TransformGroupResult) => {
  if (data.fail.length && data.success.length) {
    return ResultsStatus.Mixed
  }

  if (data.fail.length) {
    return ResultsStatus.Failed
  }

  return ResultsStatus.Success
}

const statusToLabel = {
  [ResultsStatus.Success]: 'Connected successfully',
  [ResultsStatus.Failed]: 'Failed to connect',
  [ResultsStatus.Mixed]: 'Partially connected',
}

const TestConnectionsLog = (props: Props) => {
  const { data } = props
  const statusData = [...data.success, ...data.fail]
  const status = getStatus(data)
  const [openedNav, setOpenedNav] = useState<string>('')

  const onToggle = (length: number = 0, isOpen: boolean, name: string) => {
    if (length === 0) return
    setOpenedNav(isOpen ? name : '')
  }

  const CollapsibleNavTitle = ({
    title,
    length = 0,
  }: {
    title: string
    length: number
  }) => (
    <div className={styles.collapsibleNavTitle} style={{ margin: 0 }}>
      <span data-testid="nav-group-title">{title}:</span>
      <span data-testid="number-of-connections">{length}</span>
    </div>
  )

  const navTitle = statusToLabel[status]

  const getNavGroupState = (name: ResultsStatus) =>
    openedNav === name ? 'open' : 'closed'

  const id = `${status}-connections-${getNavGroupState(status)}`

  return (
    <RiCollapsibleNavGroup
      title={
        <CollapsibleNavTitle
          title={navTitle}
          length={statusData?.length ?? 0}
        />
      }
      className={cx(styles.collapsibleNav, status, {
        [styles.disabled]: !statusData?.length,
      })}
      isCollapsible
      initialIsOpen={false}
      onToggle={(isOpen) => onToggle(statusData?.length, isOpen, status)}
      forceState={getNavGroupState(status)}
      data-testid={id}
      id={id}
    >
      <TestConnectionsTable data={statusData ?? []} />
    </RiCollapsibleNavGroup>
  )
}

export default TestConnectionsLog
