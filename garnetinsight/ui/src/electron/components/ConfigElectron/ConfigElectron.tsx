import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { UpdateInfo } from 'electron-updater'
import { IParsedDeepLink } from 'desktopSrc/lib/app/deep-link.handlers'
import {
  appServerInfoSelector,
  appElectronInfoSelector,
} from 'uiSrc/slices/app/info'
import {
  ipcAppRestart,
  ipcCheckUpdates,
  ipcSendEvents,
} from 'uiSrc/electron/utils'
import { ipcDeleteDownloadedVersion } from 'uiSrc/electron/utils/ipcDeleteStoreValues'
import { addInfiniteNotification } from 'uiSrc/slices/app/notifications'
import { INFINITE_MESSAGES } from 'uiSrc/components/notifications/components'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'

const ConfigElectron = () => {
  let isCheckedUpdates = false
  const { isReleaseNotesViewed } = useSelector(appElectronInfoSelector)
  const serverInfo = useSelector(appServerInfoSelector)

  const dispatch = useDispatch()
  const history = useHistory()

  useEffect(() => {
    window.app?.deepLinkAction?.(deepLinkAction)
    window.app?.updateAvailable?.(updateAvailableAction)
  }, [])

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
    sendEventTelemetry({ event: TelemetryEvent.UPDATE_NOTIFICATION_DISPLAYED })
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
  }

  return null
}

export default ConfigElectron
