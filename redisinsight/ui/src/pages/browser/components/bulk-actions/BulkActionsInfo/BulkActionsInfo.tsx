import React from 'react'
import { isUndefined } from 'lodash'
import cx from 'classnames'

import { RiText } from 'uiBase/text'
import { getApproximatePercentage, Maybe, Nullable } from 'uiSrc/utils'
import Divider from 'uiSrc/components/divider/Divider'
import { BulkActionsStatus, KeyTypes } from 'uiSrc/constants'
import GroupBadge from 'uiSrc/components/group-badge/GroupBadge'
import { isProcessedBulkAction } from 'uiSrc/pages/browser/components/bulk-actions/utils'
import styles from './styles.module.scss'

export interface Props {
  title?: string | React.ReactNode
  subTitle?: string | React.ReactNode
  loading: boolean
  filter?: Nullable<KeyTypes>
  status: Maybe<BulkActionsStatus>
  search?: string
  progress?: {
    total: Maybe<number>
    scanned: Maybe<number>
  }
  children?: React.ReactNode
}

const BulkActionsInfo = (props: Props) => {
  const {
    children,
    loading,
    filter,
    search,
    status,
    progress,
    title = 'Delete Keys with',
    subTitle,
  } = props
  const { total = 0, scanned = 0 } = progress || {}

  return (
    <div className={styles.container} data-testid="bulk-actions-info">
      <div className={styles.header}>
        <RiText color="subdued" className={styles.title}>
          {title}
        </RiText>
        <RiText color="subdued" className={styles.subTitle}>
          {subTitle}
          {filter && (
            <div
              className={styles.filter}
              data-testid="bulk-actions-info-filter"
            >
              <span style={{ paddingRight: 6 }}>Key type:</span>
              <GroupBadge type={filter} className={styles.badge} />
            </div>
          )}
          {search && (
            <div
              className={styles.search}
              data-testid="bulk-actions-info-search"
            >
              Pattern:
              <span className={styles.match}>{` ${search}`}</span>
            </div>
          )}
        </RiText>
        {!isUndefined(status) && !isProcessedBulkAction(status) && (
          <RiText
            color="subdued"
            className={styles.progress}
            data-testid="bulk-status-progress"
          >
            In progress:
            <span>{` ${getApproximatePercentage(total, scanned)}`}</span>
          </RiText>
        )}
        {status === BulkActionsStatus.Aborted && (
          <RiText
            color="danger"
            className={styles.progress}
            data-testid="bulk-status-stopped"
          >
            Stopped: {getApproximatePercentage(total, scanned)}
          </RiText>
        )}
        {status === BulkActionsStatus.Completed && (
          <RiText
            className={cx(styles.progress, styles.progressCompleted)}
            data-testid="bulk-status-completed"
          >
            Action completed
          </RiText>
        )}
        {status === BulkActionsStatus.Disconnected && (
          <RiText
            color="danger"
            className={styles.progress}
            data-testid="bulk-status-disconnected"
          >
            Connection Lost: {getApproximatePercentage(total, scanned)}
          </RiText>
        )}
      </div>
      <Divider colorVariable="separatorColor" className={styles.divider} />
      {loading && (
        <div className={styles.progressLine} data-testid="progress-line">
          <div style={{ width: `${(total ? scanned / total : 0) * 100}%` }} />
        </div>
      )}
      <div className={styles.children}>{children}</div>
    </div>
  )
}

export default BulkActionsInfo
