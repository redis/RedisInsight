import { useMemo } from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'
import { Environment } from 'apiClient'
import {
  connectedInstanceDangerousCommandsSelector,
  connectedInstanceSelector,
} from 'uiSrc/slices/instances/instances'

export interface UseDatabaseEnvironmentResult {
  environment: Environment
  isDangerousCommand: (cmd: string) => boolean
}

export const useDatabaseEnvironment = (): UseDatabaseEnvironmentResult => {
  const dangerousCommands = useAppSelector(
    connectedInstanceDangerousCommandsSelector,
  )
  const connectedInstance = useAppSelector(connectedInstanceSelector)

  const environment: Environment = connectedInstance.environment

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
