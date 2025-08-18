import React from 'react'
import cx from 'classnames'

import { RiText } from 'uiBase/text'
import { RiIcon } from 'uiBase/icons'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import styles from './styles.module.scss'
import { RiRow } from 'uiBase/layout'

export interface Props {
  connectionType?: ConnectionType
  isSpublishNotSupported: boolean
}

const EmptyMessagesList = ({
  connectionType,
  isSpublishNotSupported,
}: Props) => (
  <div className={styles.container} data-testid="empty-messages-list">
    <div
      className={cx(styles.content, {
        [styles.contentCluster]: connectionType === ConnectionType.Cluster,
      })}
    >
      <RiText className={styles.title}>No messages to display</RiText>
      <RiText className={styles.summary}>
        Subscribe to the Channel to see all the messages published to your
        database
      </RiText>
      <RiRow>
        <RiIcon type="ToastDangerIcon" className={styles.alertIcon} />
        <RiText className={styles.alert}>
          Running in production may decrease performance and memory available
        </RiText>
      </RiRow>
      {connectionType === ConnectionType.Cluster && isSpublishNotSupported && (
        <>
          <div className={styles.separator} />
          <RiText
            className={styles.cluster}
            data-testid="empty-messages-list-cluster"
          >
            {'Messages published with '}
            <span className={styles.badge}>SPUBLISH</span>
            {' will not appear in this channel'}
          </RiText>
        </>
      )}
    </div>
  </div>
)

export default EmptyMessagesList
