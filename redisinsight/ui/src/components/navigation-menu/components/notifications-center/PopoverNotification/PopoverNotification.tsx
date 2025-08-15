import cx from 'classnames'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RiIconButton } from 'uiBase/forms'
import { CancelSlimIcon } from 'uiBase/icons'
import { RiPopover } from 'uiBase/display'
import {
  notificationCenterSelector,
  setIsCenterOpen,
  setIsNotificationOpen,
  unreadNotificationsAction,
} from 'uiSrc/slices/app/notifications'
import { IGlobalNotification } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import Notification from '../Notification'

import styles from '../styles.module.scss'

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
          anchorClassName={styles.popoverAnchor}
          panelClassName={cx(
            'popoverLikeTooltip',
            styles.popoverNotificationTooltip,
          )}
          button={<div className={styles.popoverAnchor} />}
          onMouseUp={onMouseUpPopover}
        >
          <div
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className={styles.popoverNotification}
            data-testid="notification-popover"
          >
            <RiIconButton
              icon={CancelSlimIcon}
              aria-label="Close notification"
              className={styles.closeBtn}
              onMouseUp={(e: React.MouseEvent) => e.stopPropagation()}
              onClick={() => handleClickClose(lastReceivedNotification)}
              data-testid="close-notification-btn"
            />
            <Notification notification={lastReceivedNotification} />
          </div>
        </RiPopover>
      )}
    </>
  )
}

export default PopoverNotification
