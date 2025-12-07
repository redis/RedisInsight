import { ElectronStorageItem, IpcInvokeEvent } from 'uiSrc/electron/constants'

export const ipcDeleteDownloadedVersion = async () => {
  await window.app.ipc.invoke(
    IpcInvokeEvent.deleteStoreValue,
    ElectronStorageItem.updateDownloadedVersion,
  )
}
