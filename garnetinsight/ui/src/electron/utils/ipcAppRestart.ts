import { IpcInvokeEvent } from 'uiSrc/electron/constants'

export const ipcAppRestart = async () => {
  await window.app?.ipc?.invoke(IpcInvokeEvent.appRestart)
}
