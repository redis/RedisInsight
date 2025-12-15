import { IpcInvokeEvent } from '../constants'

export const ipcAzureSsoAuth = async () => {
  await window.app?.ipc?.invoke?.(IpcInvokeEvent.azureSsoOauth)
}

