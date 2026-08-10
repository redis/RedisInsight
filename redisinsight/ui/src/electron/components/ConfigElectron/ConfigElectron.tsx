import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import { useHistory } from 'react-router-dom'
import { UpdateInfo } from 'electron-updater'
import {
  AppUpdateState,
  AppUpdateStatus,
  AppUpdateStrategy,
  ElectronStorageItem,
  IParsedDeepLink,
  IpcInvokeEvent,
} from 'uiSrc/electron/constants'
import {
  appServerInfoSelector,
  appElectronInfoSelector,
} from 'uiSrc/slices/app/info'
import {
  ipcAppRestart,
  ipcAppUpdateDownload,
  ipcCheckUpdates,
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

const createToastGuard = () => {
  let dismissedVersion: string | null = null
  let lastVersion: string | null = null
  let resolvedRef = { current: false }

  return {
    get lastVersion() {
      return lastVersion
    },
    shouldSkip: (version?: string) =>
      !!version &&
      (version === dismissedVersion ||
        (version === lastVersion && !resolvedRef.current)),
    resolveCurrent: () => {
      resolvedRef.current = true
    },
    beginShowing: (version?: string) => {
      resolvedRef.current = true
      resolvedRef = { current: false }
      lastVersion = version ?? null
      return resolvedRef
    },
    dismiss: (version?: string) => {
      dismissedVersion = version ?? null
    },
  }
}

const ConfigElectron = () => {
  let isCheckedUpdates = false
  const foundGuard = createToastGuard()
  const restartGuard = createToastGuard()
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
    if (restartGuard.shouldSkip(version)) {
      return
    }
    foundGuard.resolveCurrent()
    dispatch(removeInfiniteNotification(InfiniteMessagesIds.appUpdateFound))

    const resolvedRef = restartGuard.beginShowing(version)
    dispatch(
      addInfiniteNotification(
        INFINITE_MESSAGES.APP_UPDATE_AVAILABLE(
          version,
          () => {
            sendEventTelemetry({
              event: TelemetryEvent.UPDATE_NOTIFICATION_RESTART_CLICKED,
            })
            ipcAppRestart()
          },
          () => {
            if (resolvedRef.current) return
            resolvedRef.current = true
            restartGuard.dismiss(version)
            dispatch(
              removeInfiniteNotification(
                InfiniteMessagesIds.appUpdateAvailable,
              ),
            )
          },
        ),
      ),
    )

    window.app?.ipc
      ?.invoke(
        IpcInvokeEvent.getStoreValue,
        ElectronStorageItem.updateDownloadedStrategy,
      )
      ?.then((strategy: AppUpdateStrategy | undefined) => {
        sendEventTelemetry({
          event: TelemetryEvent.UPDATE_NOTIFICATION_DISPLAYED,
          eventData: { strategy: strategy ?? AppUpdateStrategy.auto },
        })
      })
  }

  const showUpdateFoundToast = (version: string) => {
    sendEventTelemetry({
      event: TelemetryEvent.UPDATE_NOTIFICATION_DISPLAYED,
      eventData: { strategy: AppUpdateStrategy.notify },
    })
    const resolvedRef = foundGuard.beginShowing(version)
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
              foundGuard.dismiss(version)
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
        if (foundGuard.shouldSkip(version)) {
          return
        }
        dispatch(
          removeInfiniteNotification(InfiniteMessagesIds.appUpdateAvailable),
        )
        showUpdateFoundToast(version ?? '')
        break
      case AppUpdateStatus.Error: {
        dispatch(removeInfiniteNotification(InfiniteMessagesIds.appUpdateFound))
        dispatch(
          addMessageNotification({
            title: t('notification.error.appUpdateFailed.title'),
            message: t('notification.error.appUpdateFailed.message'),
            variant: 'danger',
          }),
        )
        const lastFoundVersion = foundGuard.lastVersion
        if (lastFoundVersion !== null) {
          showUpdateFoundToast(lastFoundVersion)
        }
        break
      }
      default:
        break
    }
  }

  return null
}

export default ConfigElectron
