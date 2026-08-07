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
  let hasShownFoundToast = false
  let lastAvailableVersion = ''
  let dismissedVersion: string | null = null
  let foundToastResolvedRef = { current: false }
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
    foundToastResolvedRef.current = true
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
    sendEventTelemetry({
      event: TelemetryEvent.UPDATE_NOTIFICATION_DISPLAYED,
      eventData: { strategy: AppUpdateStrategy.notify },
    })
    const resolvedRef = { current: false }
    foundToastResolvedRef = resolvedRef
    dispatch(
      addInfiniteNotification(
        INFINITE_MESSAGES.APP_UPDATE_FOUND(
          version,
          () => {
            if (resolvedRef.current) return
            resolvedRef.current = true
            sendEventTelemetry({
              event: TelemetryEvent.UPDATE_NOTIFICATION_DOWNLOAD_CLICKED,
            })
            dispatch(
              addInfiniteNotification(
                INFINITE_MESSAGES.APP_UPDATE_DOWNLOADING(),
              ),
            )
            ipcAppUpdateDownload(version)
          },
          () => {
            if (resolvedRef.current) return
            resolvedRef.current = true
            sendEventTelemetry({
              event: TelemetryEvent.UPDATE_NOTIFICATION_SKIPPED,
            })
            dispatch(
              removeInfiniteNotification(InfiniteMessagesIds.appUpdateFound),
            )
            ipcSkipUpdateVersion(version)
          },
          () => {
            if (!resolvedRef.current) {
              resolvedRef.current = true
              dismissedVersion = version
              sendEventTelemetry({
                event: TelemetryEvent.UPDATE_NOTIFICATION_CLOSED,
              })
              dispatch(
                removeInfiniteNotification(InfiniteMessagesIds.appUpdateFound),
              )
            }
          },
        ),
      ),
    )
  }

  const updateStateAction = (_e: any, { status, version }: AppUpdateState) => {
    switch (status) {
      case AppUpdateStatus.Available:
        if (version && version === dismissedVersion) {
          return
        }
        hasShownFoundToast = true
        lastAvailableVersion = version ?? ''
        dispatch(
          removeInfiniteNotification(InfiniteMessagesIds.appUpdateAvailable),
        )
        showUpdateFoundToast(lastAvailableVersion)
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
        if (hasShownFoundToast) {
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
