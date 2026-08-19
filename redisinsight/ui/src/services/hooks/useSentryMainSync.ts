import { useEffect, useRef } from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'
import { userSettingsConfigSelector } from 'uiSrc/slices/user/user-settings'
import { appServerInfoSelector } from 'uiSrc/slices/app/info'
import { IpcInvokeEvent } from 'uiSrc/electron/constants'

/**
 * Sends the Sentry context only the renderer knows — analytics consent and the
 * installation id — to the Electron main process. Neither is sent until known.
 */
export const useSentryMainSync = () => {
  const config = useAppSelector(userSettingsConfigSelector)
  const serverInfo = useAppSelector(appServerInfoSelector)

  const granted = config?.agreements?.analytics
  const installationId = serverInfo?.id

  const lastSentConsent = useRef<boolean | undefined>(undefined)
  const lastSentInstallationId = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (typeof granted !== 'boolean' || granted === lastSentConsent.current) {
      return
    }
    lastSentConsent.current = granted
    window.app?.ipc?.invoke(IpcInvokeEvent.setSentryConsent, granted)
  }, [granted])

  useEffect(() => {
    if (!installationId || installationId === lastSentInstallationId.current) {
      return
    }
    lastSentInstallationId.current = installationId
    window.app?.ipc?.invoke(
      IpcInvokeEvent.setSentryInstallationId,
      installationId,
    )
  }, [installationId])
}
