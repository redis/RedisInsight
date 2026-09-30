import cx from 'classnames'
import React, { useEffect } from 'react'
import { useTranslation } from 'uiSrc/i18n'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import {
  fetchNotificationsAction,
  notificationCenterSelector,
  setIsCenterOpen,
  unreadNotificationsAction,
} from 'uiSrc/slices/app/notifications'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { RiPopover } from 'uiSrc/components/base'
import Notification from './Notification'

import styles from './styles.module.scss'

const NotificationCenter = () => {
  const { t } = useTranslation()
  const { isCenterOpen, notifications } = useAppSelector(
    notificationCenterSelector,
  )

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (isCenterOpen) {
      dispatch(
        fetchNotificationsAction((totalUnread, length) => {
          totalUnread && dispatch(unreadNotificationsAction())

          sendEventTelemetry({
            event: TelemetryEvent.NOTIFICATIONS_HISTORY_OPENED,
            eventData: {
              notifications: length,
              unreadNotifications: totalUnread,
            },
          })
        }),
      )
    }
  }, [isCenterOpen])

  const hasNotifications = !!notifications?.length

  return (
    <RiPopover
      anchorPosition="rightUp"
      isOpen={isCenterOpen}
      panelClassName={cx('popoverLikeTooltip', styles.popoverCenterWrapper)}
      anchorClassName={styles.popoverAnchor}
      closePopover={() => dispatch(setIsCenterOpen(false))}
      button={<div className={styles.popoverAnchor} />}
    >
      <div
        className={styles.popoverNotificationCenter}
        data-testid="notification-center"
      >
        <Title size="S" className={styles.title}>
          {t('navigation.notifications.title')}
        </Title>
        {!hasNotifications && (
          <div className={styles.noItemsText}>
            <Text color="subdued" data-testid="no-notifications-text">
              {t('navigation.notifications.empty')}
            </Text>
          </div>
        )}
        {hasNotifications && (
          <div
            className={styles.notificationsList}
            data-testid="notifications-list"
          >
            {notifications.map((notification) => (
              <div
                key={notification.timestamp}
                className={cx(styles.notificationItem, {
                  [styles.unread]: !notification.read,
                })}
                data-testid={`notification-item-${notification.read ? 'read' : 'unread'}_${notification.timestamp}`}
              >
                <Notification notification={notification} titleSize="XS" />
              </div>
            ))}
          </div>
        )}
      </div>
    </RiPopover>
  )
}

export default NotificationCenter
