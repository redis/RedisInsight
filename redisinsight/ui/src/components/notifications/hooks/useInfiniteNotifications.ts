import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { InfiniteMessage } from 'uiSrc/slices/interfaces'
import { riToast } from 'uiSrc/components/base/display/toast'
import {
  infiniteNotificationsSelector,
  removeInfiniteNotification,
} from 'uiSrc/slices/app/notifications'
import cx from 'classnames'
import { InfiniteMessagesIds } from 'uiSrc/components/notifications/components'
import { showOAuthProgress } from 'uiSrc/slices/oauth/cloud'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

const ONE_HOUR = 3_600_000

export const useInfiniteNotifications = () => {
  const infiniteNotifications = useSelector(infiniteNotificationsSelector)
  const dispatch = useDispatch()
  const infiniteToastIdsRef = useRef(new Map<string, number | string>())

  const showInfiniteToasts = (data: InfiniteMessage[]) => {
    data.forEach((notification: InfiniteMessage) => {
      const {
        id,
        message,
        description,
        actions,
        className = '',
        variant,
        customIcon,
        showCloseButton = true,
        onClose: onCloseCallback,
      } = notification
      const toastId = riToast(
        {
          className: cx(className),
          message: message,
          description: description,
          actions,
          showCloseButton,
          customIcon,
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

            dispatch(removeInfiniteNotification(id))
            onCloseCallback?.()
          },
        },
        {
          variant: variant ?? riToast.Variant.Notice,
          autoClose: ONE_HOUR,
        },
      )
      // if this infinite toast id is already in the map, dismiss it
      if (infiniteToastIdsRef.current.has(id)) {
        riToast.dismiss(infiniteToastIdsRef.current.get(id))
      }
      infiniteToastIdsRef.current.set(id, toastId)
    })
  }

  useEffect(() => {
    showInfiniteToasts(infiniteNotifications)
  }, [infiniteNotifications])
}
