import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { appFeatureFlagDevProdModeSelector } from 'uiSrc/slices/app/features'
import {
  connectedInstanceDangerousCommandsSelector,
  connectedInstanceSelector,
} from 'uiSrc/slices/instances/instances'
import { appSettingsSkipConfirmationsForNonProdSelector } from 'uiSrc/slices/user/user-settings'
import { getProdModeForDatabase, ProdMode } from 'uiSrc/utils/prodMode'

export interface UseProdModeResult {
  mode: ProdMode
  isDangerousCommand: (cmd: string) => boolean
}

export const useProdMode = (): UseProdModeResult => {
  const flagEnabled = useSelector(appFeatureFlagDevProdModeSelector)
  const skipConfirmations = useSelector(
    appSettingsSkipConfirmationsForNonProdSelector,
  )
  const dangerousCommands = useSelector(
    connectedInstanceDangerousCommandsSelector,
  )
  const connectedInstance = useSelector(connectedInstanceSelector)

  const isConnected = Boolean(connectedInstance.id)
  const mode: ProdMode = isConnected
    ? getProdModeForDatabase(connectedInstance, {
        flagEnabled,
        skipConfirmations,
      })
    : 'disabled'

  const isDangerousCommand = useMemo(() => {
    const upper = new Set(dangerousCommands.map((c) => c.toUpperCase()))
    return (cmd: string): boolean => {
      if (mode !== 'production') return false
      if (!cmd) return false
      return upper.has(cmd.toUpperCase())
    }
  }, [mode, dangerousCommands])

  return { mode, isDangerousCommand }
}
