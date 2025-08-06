import React from 'react'
import cx from 'classnames'

import { ConnectionType } from 'uiSrc/slices/interfaces'
import { Text } from 'uiSrc/components/base/text'

import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import styles from './styles.module.scss'
import { Row } from 'uiSrc/components/base/layout/flex'

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
      <Text className={styles.title}>No messages to display</Text>
      <Text className={styles.summary}>
        Subscribe to the Channel to see all the messages published to your
        database
      </Text>
      <Row>
        <RiIcon type="ToastDangerIcon" className={styles.alertIcon} />
        <Text className={styles.alert}>
          Running in production may decrease performance and memory available
        </Text>
      </Row>
      {connectionType === ConnectionType.Cluster && isSpublishNotSupported && (
        <>
          <div className={styles.separator} />
          <Text
            className={styles.cluster}
            data-testid="empty-messages-list-cluster"
          >
            {'Messages published with '}
            <span className={styles.badge}>SPUBLISH</span>
            {' will not appear in this channel'}
          </Text>
        </>
      )}
    </div>
  </div>
)

export default EmptyMessagesList
