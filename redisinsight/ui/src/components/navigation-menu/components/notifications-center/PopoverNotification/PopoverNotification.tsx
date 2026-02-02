import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  notificationCenterSelector,
  setIsCenterOpen,
  setIsNotificationOpen,
  unreadNotificationsAction,
} from 'uiSrc/slices/app/notifications'
import { IGlobalNotification } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import { RiPopover } from 'uiSrc/components/base'
import Notification from '../Notification'

import * as S from '../NotificationsCenter.styles'

const CLOSE_NOTIFICATION_TIME = 6000

const PopoverNotification = () => {
  const { isNotificationOpen, isCenterOpen, lastReceivedNotification } =
    useSelector(notificationCenterSelector)
  const [isHovering, setIsHovering] = useState(false)
  const [isShowNotification, setIsShowNotification] =
    useState(isNotificationOpen)

  const timeOutRef = useRef<NodeJS.Timeout>()

  const dispatch = useDispatch()

  useEffect(() => {
    if (isShowNotification && isCenterOpen) {
      onCloseNotification()
      return
    }

    // if notification center is opened - wait closing and show notification
    if (isNotificationOpen && !isCenterOpen) {
      setTimeout(() => {
        setIsShowNotification(isNotificationOpen)
      }, 300)
    }
  }, [isNotificationOpen, isCenterOpen])

  useEffect(() => {
    if (isShowNotification) {
      if (isHovering) {
        timeOutRef.current && clearTimeout(timeOutRef.current)
        return
      }

      timeOutRef.current = setTimeout(
        onCloseNotification,
        CLOSE_NOTIFICATION_TIME,
      )
    }
  }, [isShowNotification, isHovering])

  const onCloseNotification = () => {
    setIsShowNotification(false)
    dispatch(setIsNotificationOpen(false))
  }

  const handleClickClose = (notification: IGlobalNotification) => {
    onCloseNotification()
    dispatch(
      unreadNotificationsAction({
        timestamp: notification.timestamp,
        type: notification.type,
      }),
    )

    sendEventTelemetry({
      event: TelemetryEvent.NOTIFICATIONS_MESSAGE_CLOSED,
      eventData: {
        notificationID: lastReceivedNotification?.timestamp,
      },
    })
  }

  const onMouseUpPopover = () => {
    if (!window.getSelection()?.toString()) {
      dispatch(setIsCenterOpen())
    }
  }

  return (
    <>
      {lastReceivedNotification && (
        <RiPopover
          anchorPosition="rightUp"
          isOpen={isShowNotification}
          closePopover={() => {}}
          panelClassName="popoverLikeTooltip"
          minWidth={S.POPOVER_MIN_WIDTH}
          button={<S.PopoverAnchor />}
          onMouseUp={onMouseUpPopover}
        >
          <S.PopoverNotification
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            data-testid="notification-popover"
          >
            <S.CloseBtn>
              <IconButton
                icon={CancelSlimIcon}
                aria-label="Close notification"
                onMouseUp={(e: React.MouseEvent) => e.stopPropagation()}
                onClick={() => handleClickClose(lastReceivedNotification)}
                data-testid="close-notification-btn"
              />
            </S.CloseBtn>
            <Notification notification={lastReceivedNotification} />
          </S.PopoverNotification>
        </RiPopover>
      )}
    </>
  )
}

export default PopoverNotification
