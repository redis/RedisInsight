import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Environment } from 'apiClient'
import { appFeatureFlagDevProdModeSelector } from 'uiSrc/slices/app/features'
import {
  connectedInstanceDangerousCommandsSelector,
  connectedInstanceSelector,
} from 'uiSrc/slices/instances/instances'

export interface UseDatabaseEnvironmentResult {
  environment: Environment
  isDangerousCommand: (cmd: string) => boolean
}

export const useDatabaseEnvironment = (): UseDatabaseEnvironmentResult => {
  const flagEnabled = useSelector(appFeatureFlagDevProdModeSelector)
  const dangerousCommands = useSelector(
    connectedInstanceDangerousCommandsSelector,
  )
  const connectedInstance = useSelector(connectedInstanceSelector)

  const environment: Environment = flagEnabled
    ? connectedInstance.environment
    : Environment.Unspecified

  const isDangerousCommand = useMemo(() => {
    const upper = new Set(dangerousCommands.map((c) => c.toUpperCase()))
    return (cmd: string): boolean => {
      if (environment !== Environment.Production) return false
      if (!cmd) return false
      return upper.has(cmd.toUpperCase())
    }
  }, [environment, dangerousCommands])

  return { environment, isDangerousCommand }
}
