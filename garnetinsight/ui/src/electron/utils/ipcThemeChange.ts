import { IpcInvokeEvent } from '../constants'

export const ipcThemeChange = async (value: string) => {
  await window.app?.ipc?.invoke?.(IpcInvokeEvent.themeChange, value)
}
