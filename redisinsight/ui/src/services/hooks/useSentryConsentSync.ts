import { useEffect, useRef } from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'
import { userSettingsConfigSelector } from 'uiSrc/slices/user/user-settings'
import { IpcInvokeEvent } from 'uiSrc/electron/constants'

/**
 * Syncs the user's analytics consent to the Electron main process so it can
 * pick the correct Sentry tier and cache it for the next boot.
 *
 * The renderer's own Sentry self-gates per-event via `checkIsAnalyticsGranted`,
 * so this hook only informs the main process. Until the agreement is known
 * (e.g. EULA not yet accepted), nothing is sent and the main process stays in
 * its default-deny (anonymous Tier 1) mode.
 *
 * See docs/sentry-production-readiness.md (§3, §5).
 */
export const useSentryConsentSync = () => {
  const config = useAppSelector(userSettingsConfigSelector)
  const granted = config?.agreements?.analytics
  const lastSent = useRef<boolean | undefined>(undefined)

  useEffect(() => {
    if (typeof granted !== 'boolean' || granted === lastSent.current) {
      return
    }
    lastSent.current = granted
    window.app?.ipc?.invoke(IpcInvokeEvent.setSentryConsent, granted)
  }, [granted])
}
