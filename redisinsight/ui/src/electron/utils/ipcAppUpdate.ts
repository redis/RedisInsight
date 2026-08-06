import { AppUpdateStrategy, IpcInvokeEvent } from 'uiSrc/electron/constants'

export const ipcGetUpdateStrategy =
  async (): Promise<AppUpdateStrategy | null> =>
    (await window.app?.ipc?.invoke(IpcInvokeEvent.getUpdateStrategy)) ?? null

export const ipcSetUpdateStrategy = async (strategy: AppUpdateStrategy) => {
  await window.app?.ipc?.invoke(IpcInvokeEvent.setUpdateStrategy, strategy)
}

export const ipcAppUpdateDownload = async () => {
  await window.app?.ipc?.invoke(IpcInvokeEvent.appUpdateDownload)
}

export const ipcSkipUpdateVersion = async (version: string) => {
  await window.app?.ipc?.invoke(IpcInvokeEvent.skipUpdateVersion, version)
}
