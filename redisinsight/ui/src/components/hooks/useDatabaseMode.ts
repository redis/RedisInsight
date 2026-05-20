import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { DatabaseMode } from 'apiClient'
import { appFeatureFlagDevProdModeSelector } from 'uiSrc/slices/app/features'
import {
  connectedInstanceDangerousCommandsSelector,
  connectedInstanceSelector,
} from 'uiSrc/slices/instances/instances'

export interface UseDatabaseModeResult {
  mode: DatabaseMode
  isDangerousCommand: (cmd: string) => boolean
}

export const useDatabaseMode = (): UseDatabaseModeResult => {
  const flagEnabled = useSelector(appFeatureFlagDevProdModeSelector)
  const dangerousCommands = useSelector(
    connectedInstanceDangerousCommandsSelector,
  )
  const connectedInstance = useSelector(connectedInstanceSelector)

  const isConnected = Boolean(connectedInstance.id)
  const mode: DatabaseMode =
    isConnected && flagEnabled
      ? connectedInstance.databaseMode
      : DatabaseMode.Unmarked

  const isDangerousCommand = useMemo(() => {
    const upper = new Set(dangerousCommands.map((c) => c.toUpperCase()))
    return (cmd: string): boolean => {
      if (mode !== DatabaseMode.Production) return false
      if (!cmd) return false
      return upper.has(cmd.toUpperCase())
    }
  }, [mode, dangerousCommands])

  return { mode, isDangerousCommand }
}
