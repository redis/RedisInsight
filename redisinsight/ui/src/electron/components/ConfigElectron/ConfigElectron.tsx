import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import { useHistory } from 'react-router-dom'
import { UpdateInfo } from 'electron-updater'
import { IParsedDeepLink } from 'uiSrc/electron/constants'
import {
  appServerInfoSelector,
  appElectronInfoSelector,
} from 'uiSrc/slices/app/info'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { FeatureFlags } from 'uiSrc/constants'
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
  const { isReleaseNotesViewed } = useAppSelector(appElectronInfoSelector)
  const serverInfo = useAppSelector(appServerInfoSelector)
  const { [FeatureFlags.whatsNew]: whatsNewFeature } = useAppSelector(
    appFeatureFlagsFeaturesSelector,
  )

  const dispatch = useAppDispatch()
  const history = useHistory()

  useEffect(() => {
    window.app?.deepLinkAction?.(deepLinkAction)
    window.app?.updateAvailable?.(updateAvailableAction)
  }, [])

  // Deliberately keyed on serverInfo only: this must run once per app load
  // (it consumes one-shot electron-store flags). The whatsNew flag has its
  // config default before the async flags fetch resolves, so it is safe to
  // read without re-running the effect.
  useEffect(() => {
    if (serverInfo) {
      ipcCheckUpdates(serverInfo, dispatch, !!whatsNewFeature?.flag)
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
