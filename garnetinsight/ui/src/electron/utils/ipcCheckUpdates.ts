import { Dispatch } from 'react'
import { omit } from 'lodash'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { ReleaseNotesSource } from 'uiSrc/constants/telemetry'
import { setElectronInfo, setReleaseNotesViewed } from 'uiSrc/slices/app/info'
import { addMessageNotification } from 'uiSrc/slices/app/notifications'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { GetServerInfoResponse } from 'apiSrc/modules/server/dto/server.dto'
import { ElectronStorageItem, IpcInvokeEvent } from '../constants'

export const ipcCheckUpdates = async (
  serverInfo: GetServerInfoResponse,
  dispatch: Dispatch<any>,
) => {
  const isUpdateDownloaded = await window.app.ipc.invoke(
    IpcInvokeEvent.getStoreValue,
    ElectronStorageItem.updateDownloaded,
  )
  const isUpdateAvailable = await window.app.ipc.invoke(
    IpcInvokeEvent.getStoreValue,
    ElectronStorageItem.isUpdateAvailable,
  )
  const updateDownloadedVersion = await window.app.ipc.invoke(
    IpcInvokeEvent.getStoreValue,
    ElectronStorageItem.updateDownloadedVersion,
  )

  if (isUpdateDownloaded && !isUpdateAvailable) {
    if (serverInfo.appVersion === updateDownloadedVersion) {
      dispatch(
        addMessageNotification(
          successMessages.INSTALLED_NEW_UPDATE(updateDownloadedVersion, () => {
            dispatch(setReleaseNotesViewed(true))
            sendEventTelemetry({
              event: TelemetryEvent.RELEASE_NOTES_LINK_CLICKED,
              eventData: {
                source: ReleaseNotesSource.updateNotification,
              },
            })
          }),
        ),
      )
    }

    await window.app.ipc.invoke(
      IpcInvokeEvent.deleteStoreValue,
      ElectronStorageItem.updateDownloaded,
    )
  }

  if (
    updateDownloadedVersion &&
    !isUpdateAvailable &&
    serverInfo.appVersion === updateDownloadedVersion
  ) {
    dispatch(setReleaseNotesViewed(false))
  }

  dispatch(setElectronInfo({ updateDownloadedVersion, isUpdateAvailable }))
}

export const ipcSendEvents = async (serverInfo: GetServerInfoResponse) => {
  const isUpdateDownloadedForTelemetry = await window.app.ipc.invoke(
    IpcInvokeEvent.getStoreValue,
    ElectronStorageItem.updateDownloadedForTelemetry,
  )
  const isUpdateAvailable = await window.app.ipc.invoke(
    IpcInvokeEvent.getStoreValue,
    ElectronStorageItem.isUpdateAvailable,
  )

  if (isUpdateDownloadedForTelemetry && !isUpdateAvailable) {
    const newVer = await window.app.ipc.invoke(
      IpcInvokeEvent.getStoreValue,
      ElectronStorageItem.updateDownloadedVersion,
    )
    const prevVer = await window.app.ipc.invoke(
      IpcInvokeEvent.getStoreValue,
      ElectronStorageItem.updatePreviousVersion,
    )
    sendEventTelemetry({
      event: TelemetryEvent.APPLICATION_UPDATED,
      eventData: {
        ...omit(serverInfo, ['id', 'createDateTime']),
        fromVersion: prevVer,
        toVersion: newVer,
      },
    })
    await window.app.ipc.invoke(
      IpcInvokeEvent.deleteStoreValue,
      ElectronStorageItem.updateDownloadedForTelemetry,
    )
  }
}
