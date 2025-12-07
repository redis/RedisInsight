import { OAuthStrategy } from 'uiSrc/slices/interfaces'
import { IpcInvokeEvent } from '../constants'

export const ipcAuth = async (
  strategy: OAuthStrategy,
  action: string,
  data?: {},
) => {
  await window.app?.ipc?.invoke?.(IpcInvokeEvent.cloudOauth, {
    strategy,
    action,
    data,
  })
}
