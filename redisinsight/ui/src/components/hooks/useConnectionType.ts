import { useAppSelector } from 'uiSrc/slices/hooks'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'

export const useConnectionType = () => {
  const { connectionType, forceStandalone } = useAppSelector(
    connectedInstanceSelector,
  )

  if (forceStandalone && connectionType !== ConnectionType.Sentinel) {
    return ConnectionType.Standalone
  }
  return connectionType
}
