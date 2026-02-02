import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchNotificationsAction,
  notificationCenterSelector,
  setIsCenterOpen,
  unreadNotificationsAction,
} from 'uiSrc/slices/app/notifications'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { Text } from 'uiSrc/components/base/text'
import { RiPopover } from 'uiSrc/components/base'
import Notification from './Notification'

import * as S from './NotificationsCenter.styles'

const NotificationCenter = () => {
  const { isCenterOpen, notifications } = useSelector(
    notificationCenterSelector,
  )

  const dispatch = useDispatch()

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
      panelClassName="popoverLikeTooltip"
      minWidth={S.POPOVER_MIN_WIDTH}
      closePopover={() => dispatch(setIsCenterOpen(false))}
      button={<S.PopoverAnchor />}
    >
      <S.PopoverNotificationCenter data-testid="notification-center">
        <S.CenterTitle size="S">Notification Center</S.CenterTitle>
        {!hasNotifications && (
          <S.NoItemsText>
            <Text color="subdued" data-testid="no-notifications-text">
              No notifications to display.
            </Text>
          </S.NoItemsText>
        )}
        {hasNotifications && (
          <S.NotificationsList data-testid="notifications-list">
            {notifications.map((notification) => (
              <S.NotificationItem
                key={notification.timestamp}
                $unread={!notification.read}
                data-testid={`notification-item-${notification.read ? 'read' : 'unread'}_${notification.timestamp}`}
              >
                <Notification notification={notification} titleSize="XS" />
              </S.NotificationItem>
            ))}
          </S.NotificationsList>
        )}
      </S.PopoverNotificationCenter>
    </RiPopover>
  )
}

export default NotificationCenter
