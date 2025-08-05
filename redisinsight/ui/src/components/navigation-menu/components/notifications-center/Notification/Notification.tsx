import React from 'react'
import cx from 'classnames'
import { format } from 'date-fns'
import parse from 'html-react-parser'

import { NOTIFICATION_DATE_FORMAT } from 'uiSrc/constants/notifications'
import { IGlobalNotification } from 'uiSrc/slices/interfaces'
import { truncateText } from 'uiSrc/utils'

import { RiFlexItem, RiRow } from 'uiSrc/components/base/layout'
import { TitleSize, RiTitle, RiText } from 'uiSrc/components/base/text'
import { RiBadge } from 'uiSrc/components/base/display'

import styles from '../styles.module.scss'

export interface Props {
  notification: IGlobalNotification
  titleSize?: TitleSize
}

const Notification = (props: Props) => {
  const { notification, titleSize = 'XS' } = props

  return (
    <>
      <RiTitle
        size={titleSize}
        className={styles.notificationTitle}
        data-testid="notification-title"
      >
        {notification.title}
      </RiTitle>

      <RiText
        size="s"
        color="subdued"
        className={cx('notificationHTMLBody', styles.notificationBody)}
        data-testid="notification-body"
      >
        {parse(notification.body)}
      </RiText>

      <RiRow
        className={styles.notificationFooter}
        align="center"
        justify="start"
      >
        <RiFlexItem>
          <RiText size="xs" color="subdued" data-testid="notification-date">
            {format(notification.timestamp * 1000, NOTIFICATION_DATE_FORMAT)}
          </RiText>
        </RiFlexItem>
        {notification.category && (
          <RiFlexItem>
            <RiBadge
              variant="light"
              className={styles.category}
              style={{ backgroundColor: notification.categoryColor ?? '#666' }}
              data-testid="notification-category"
              label={truncateText(notification.category, 32)}
            />
          </RiFlexItem>
        )}
      </RiRow>
    </>
  )
}

export default Notification
