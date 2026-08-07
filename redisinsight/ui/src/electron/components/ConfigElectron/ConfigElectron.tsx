import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import { useHistory } from 'react-router-dom'
import { UpdateInfo } from 'electron-updater'
import {
  AppUpdateState,
  AppUpdateStatus,
  AppUpdateStrategy,
  IParsedDeepLink,
} from 'uiSrc/electron/constants'
import {
  appServerInfoSelector,
  appElectronInfoSelector,
} from 'uiSrc/slices/app/info'
import {
  ipcAppRestart,
  ipcAppUpdateDownload,
  ipcCheckUpdates,
  ipcGetUpdateStrategy,
  ipcSendEvents,
  ipcSkipUpdateVersion,
} from 'uiSrc/electron/utils'
import { ipcDeleteDownloadedVersion } from 'uiSrc/electron/utils/ipcDeleteStoreValues'
import {
  addInfiniteNotification,
  addMessageNotification,
  removeInfiniteNotification,
} from 'uiSrc/slices/app/notifications'
import {
  INFINITE_MESSAGES,
  InfiniteMessagesIds,
} from 'uiSrc/components/notifications/components'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { useTranslation } from 'uiSrc/i18n'

const ConfigElectron = () => {
  let isCheckedUpdates = false
  // Lets a failed download restore the found-prompt with a working Update
  // button, rather than leaving the user with no retry path until the next
  // periodic check (up to 84h away).
  let lastAvailableVersion: string | undefined
  const { isReleaseNotesViewed } = useAppSelector(appElectronInfoSelector)
  const serverInfo = useAppSelector(appServerInfoSelector)

  const dispatch = useAppDispatch()
  const history = useHistory()
  const { t } = useTranslation()

  useEffect(() => {
    window.app?.deepLinkAction?.(deepLinkAction)
    window.app?.updateAvailable?.(updateAvailableAction)
    window.app?.updateState?.(updateStateAction)
  }, [])

  // Keyed on serverInfo only: must run once per load (consumes one-shot
  // electron-store flags).
  useEffect(() => {
    if (serverInfo) {
      ipcCheckUpdates(serverInfo, dispatch)
    }
  }, [serverInfo])

  useEffect(() => {
    if (!isCheckedUpdates && serverInfo) {
      ipcSendEvents(serverInfo)
      isCheckedUpdates = true
    }
  }, [serverInfo])

  useEffect(() => {
    if (isReleaseNotesViewed) {
      ipcDeleteDownloadedVersion()
    }
  }, [isReleaseNotesViewed])

  const deepLinkAction = (_e: any, url: IParsedDeepLink) => {
    if (url.from) {
      const fromUrl = encodeURIComponent(url.from)
      history.push({
        search: `from=${fromUrl}`,
      })
    }
  }

  const updateAvailableAction = (_e: any, { version }: UpdateInfo) => {
    dispatch(removeInfiniteNotification(InfiniteMessagesIds.appUpdateFound))
    dispatch(
      addInfiniteNotification(
        INFINITE_MESSAGES.APP_UPDATE_AVAILABLE(version, () => {
          sendEventTelemetry({
            event: TelemetryEvent.UPDATE_NOTIFICATION_RESTART_CLICKED,
          })
          ipcAppRestart()
        }),
      ),
    )

    ipcGetUpdateStrategy().then((strategy) => {
      sendEventTelemetry({
        event: TelemetryEvent.UPDATE_NOTIFICATION_DISPLAYED,
        eventData: { strategy },
      })
    })
  }

  const showUpdateFoundToast = (version: string) => {
    let resolved = false
    dispatch(
      addInfiniteNotification(
        INFINITE_MESSAGES.APP_UPDATE_FOUND(
          version,
          () => {
            if (resolved) return
            resolved = true
            sendEventTelemetry({
              event: TelemetryEvent.UPDATE_NOTIFICATION_DOWNLOAD_CLICKED,
            })
            dispatch(
              addInfiniteNotification(
                INFINITE_MESSAGES.APP_UPDATE_DOWNLOADING(),
              ),
            )
            ipcAppUpdateDownload()
          },
          () => {
            if (resolved) return
            resolved = true
            sendEventTelemetry({
              event: TelemetryEvent.UPDATE_NOTIFICATION_SKIPPED,
            })
            dispatch(
              removeInfiniteNotification(InfiniteMessagesIds.appUpdateFound),
            )
            ipcSkipUpdateVersion(version)
          },
          () => {
            if (!resolved) {
              sendEventTelemetry({
                event: TelemetryEvent.UPDATE_NOTIFICATION_CLOSED,
              })
            }
          },
        ),
      ),
    )
  }

  const updateStateAction = (_e: any, { status, version }: AppUpdateState) => {
    switch (status) {
      case AppUpdateStatus.Available:
        lastAvailableVersion = version
        sendEventTelemetry({
          event: TelemetryEvent.UPDATE_NOTIFICATION_DISPLAYED,
          eventData: { strategy: AppUpdateStrategy.notify },
        })
        dispatch(
          removeInfiniteNotification(InfiniteMessagesIds.appUpdateAvailable),
        )
        showUpdateFoundToast(version ?? '')
        break
      case AppUpdateStatus.Error:
        dispatch(removeInfiniteNotification(InfiniteMessagesIds.appUpdateFound))
        dispatch(
          addMessageNotification({
            title: t('notification.error.appUpdateFailed.title'),
            message: t('notification.error.appUpdateFailed.message'),
            variant: 'danger',
          }),
        )
        // Restore the retry prompt - otherwise a transient failure leaves
        // the user with no way to try again until the next periodic check.
        if (lastAvailableVersion) {
          showUpdateFoundToast(lastAvailableVersion)
        }
        break
      default:
        break
    }
  }

  return null
}

export default ConfigElectron
