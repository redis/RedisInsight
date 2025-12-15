import { IpcInvokeEvent } from '../constants'

export const ipcAzureSsoAuth = async () => {
  await window.app?.ipc?.invoke?.(IpcInvokeEvent.azureSsoOauth)
}

export const ipcAzureSsoRefreshToken = async () =>
  window.app?.ipc?.invoke?.(IpcInvokeEvent.azureSsoRefreshToken)

export const ipcAzureSsoLogout = async () =>
  window.app?.ipc?.invoke?.(IpcInvokeEvent.azureSsoLogout)

