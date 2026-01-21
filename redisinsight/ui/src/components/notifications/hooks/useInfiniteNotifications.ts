import { useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { riToast } from 'uiSrc/components/base/display/toast'
import { InfiniteMessage } from 'uiSrc/slices/interfaces'
import { infiniteNotificationsSelector } from 'uiSrc/slices/app/notifications'
import { showOAuthProgress } from 'uiSrc/slices/oauth/cloud'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { InfiniteMessagesIds } from '../components'
import { defaultContainerId, ONE_HOUR } from '../constants'

const DISPLAY_THROTTLE = 3_000 // 3 seconds - minimum time between displaying notifications
const AUTO_DISMISS_DELAY = 5_000 // 5 seconds - wait before auto-dismissing when no notifications remain

const showNotification = (notification: InfiniteMessage) => {
  if (!notification) {
    return
  }

  // Show latest notification
  return riToast(notification, {
    containerId: defaultContainerId,
    autoClose: ONE_HOUR,
  })
}

export const useInfiniteNotifications = () => {
  const notifications = useSelector(infiniteNotificationsSelector)
  const dispatch = useDispatch()
  const notificationsData = useMemo(() => {
    return notifications.map(
      ({
        id,
        message,
        description,
        actions,
        className = '',
        variant,
        customIcon,
        showCloseButton = true,
        onClose: onCloseCallback,
      }: InfiniteMessage) => {
        return {
          id,
          message,
          description,
          actions,
          className,
          variant,
          customIcon,
          showCloseButton,
          onClose: () => {
            switch (id) {
              case InfiniteMessagesIds.oAuthProgress:
                dispatch(showOAuthProgress(false))
                break
              case InfiniteMessagesIds.databaseExists:
                sendEventTelemetry({
                  event:
                    TelemetryEvent.CLOUD_IMPORT_EXISTING_DATABASE_FORM_CLOSED,
                })
                break
              case InfiniteMessagesIds.subscriptionExists:
                sendEventTelemetry({
                  event:
                    TelemetryEvent.CLOUD_CREATE_DATABASE_IN_SUBSCRIPTION_FORM_CLOSED,
                })
                break
              case InfiniteMessagesIds.appUpdateAvailable:
                sendEventTelemetry({
                  event: TelemetryEvent.UPDATE_NOTIFICATION_CLOSED,
                })
                break
              default:
                break
            }
            onCloseCallback?.()
          },
        }
      },
    )
  }, [notifications])
  const lastDisplayTimeRef = useRef<number>(0)
  const currentToastRef = useRef<ReturnType<typeof riToast> | null>(null)
  const pendingNotificationRef = useRef<InfiniteMessage | null>(null)
  const displayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoDismissTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )
  const previousNotificationsLengthRef = useRef<number>(0)

  const displayNotification = (notification: InfiniteMessage) => {
    // Dismiss current notification if any
    if (currentToastRef.current) {
      riToast.dismiss(currentToastRef.current)
      currentToastRef.current = null
    }

    // Show new notification
    const toastId = showNotification(notification)
    if (toastId) {
      currentToastRef.current = toastId
      lastDisplayTimeRef.current = Date.now()
    }
  }

  const scheduleNextDisplay = () => {
    if (pendingNotificationRef.current) {
      const timeSinceLastDisplay = Date.now() - lastDisplayTimeRef.current
      const delay = Math.max(0, DISPLAY_THROTTLE - timeSinceLastDisplay)

      if (displayTimeoutRef.current) {
        clearTimeout(displayTimeoutRef.current)
      }

      displayTimeoutRef.current = setTimeout(() => {
        if (pendingNotificationRef.current) {
          displayNotification(pendingNotificationRef.current)
          pendingNotificationRef.current = null
          displayTimeoutRef.current = null
        }
      }, delay)
    }
  }

  const clearAutoDismiss = () => {
    if (autoDismissTimeoutRef.current) {
      clearTimeout(autoDismissTimeoutRef.current)
      autoDismissTimeoutRef.current = null
    }
  }

  const scheduleAutoDismiss = () => {
    clearAutoDismiss()

    autoDismissTimeoutRef.current = setTimeout(() => {
      if (currentToastRef.current) {
        riToast.dismiss(currentToastRef.current)
        currentToastRef.current = null
      }
      autoDismissTimeoutRef.current = null
    }, AUTO_DISMISS_DELAY)
  }

  useEffect(() => {
    const previousLength = previousNotificationsLengthRef.current
    const currentLength = notificationsData.length

    // Check if notifications became empty (after a removal)
    if (previousLength > 0 && currentLength === 0) {
      // Notifications were removed, clear any pending notifications and schedule auto-dismiss
      pendingNotificationRef.current = null
      if (displayTimeoutRef.current) {
        clearTimeout(displayTimeoutRef.current)
        displayTimeoutRef.current = null
      }
      scheduleAutoDismiss()
    } else if (currentLength > 0) {
      // There are notifications, cancel auto-dismiss if scheduled
      clearAutoDismiss()

      // Get the latest notification (last in array) - use transformed data
      const latestNotification = notificationsData[notificationsData.length - 1]

      // Check if we should display immediately or defer
      const timeSinceLastDisplay = Date.now() - lastDisplayTimeRef.current

      if (timeSinceLastDisplay >= DISPLAY_THROTTLE) {
        // Enough time has passed, display immediately
        displayNotification(latestNotification)
        pendingNotificationRef.current = null

        // Clear any pending display timeout
        if (displayTimeoutRef.current) {
          clearTimeout(displayTimeoutRef.current)
          displayTimeoutRef.current = null
        }
      } else {
        // Not enough time has passed, defer the display
        pendingNotificationRef.current = latestNotification
        scheduleNextDisplay()
      }
    }

    // Update previous length for next render
    previousNotificationsLengthRef.current = currentLength

    // Cleanup on unmount
    return () => {
      if (displayTimeoutRef.current) {
        clearTimeout(displayTimeoutRef.current)
      }
      if (autoDismissTimeoutRef.current) {
        clearTimeout(autoDismissTimeoutRef.current)
      }
    }
  }, [notificationsData])
}
