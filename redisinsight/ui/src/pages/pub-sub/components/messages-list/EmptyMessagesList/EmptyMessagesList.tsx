import React from 'react'
import cx from 'classnames'

import { ConnectionType } from 'uiSrc/slices/interfaces'
import { RiText } from 'uiSrc/components/base/text'

import { RiIcon } from 'uiSrc/components/base/icons'
import styles from './styles.module.scss'

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
      <RiText className={styles.alert}>
        <RiIcon type="ToastDangerIcon" className={styles.alertIcon} />
        Running in production may decrease performance and memory available
      </RiText>
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
