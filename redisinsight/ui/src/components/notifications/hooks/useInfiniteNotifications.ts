import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { InfiniteMessage } from 'uiSrc/slices/interfaces'
import { infiniteNotificationsSelector } from 'uiSrc/slices/app/notifications'
import { InfiniteMessagesIds } from 'uiSrc/components/notifications/components'
import { showOAuthProgress } from 'uiSrc/slices/oauth/cloud'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

export const useInfiniteNotifications = () => {
  const infiniteNotifications = useSelector(infiniteNotificationsSelector)
  const dispatch = useDispatch()
  return useMemo(() => {
    return infiniteNotifications.map(
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
  }, [infiniteNotifications])
}
