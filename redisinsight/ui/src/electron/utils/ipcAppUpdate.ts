import {
  AppUpdateStrategy,
  ElectronStorageItem,
  IpcInvokeEvent,
} from 'uiSrc/electron/constants'

export const ipcGetUpdateStrategy =
  async (): Promise<AppUpdateStrategy | null> =>
    (await window.app?.ipc?.invoke(IpcInvokeEvent.getUpdateStrategy)) ?? null

export const ipcGetUpdateDownloadedStrategy =
  async (): Promise<AppUpdateStrategy> =>
    (await window.app?.ipc?.invoke(
      IpcInvokeEvent.getStoreValue,
      ElectronStorageItem.updateDownloadedStrategy,
    )) ?? AppUpdateStrategy.auto

export const ipcSetUpdateStrategy = async (strategy: AppUpdateStrategy) => {
  await window.app?.ipc?.invoke(IpcInvokeEvent.setUpdateStrategy, strategy)
}

export const ipcAppUpdateDownload = async (version: string) => {
  await window.app?.ipc?.invoke(IpcInvokeEvent.appUpdateDownload, version)
}

export const ipcSkipUpdateVersion = async (version: string) => {
  await window.app?.ipc?.invoke(IpcInvokeEvent.skipUpdateVersion, version)
}
