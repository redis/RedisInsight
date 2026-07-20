import { ConnectionType } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'

export interface ProductionHeuristicInput {
  host?: string
  tls?: boolean
  connectionType?: ConnectionType
  username?: Nullable<string>
  // Boolean flag from the API (true when a password is set), typed loosely as
  // the connected-instance object declares it as a string.
  password?: Nullable<string> | boolean
  totalKeys?: Nullable<number>
}

export interface ProductionSignals {
  hasKeyCountSignal: boolean
  isRemoteHost: boolean
  hasTls: boolean
  isClustered: boolean
  hasAuth: boolean
}

export interface UsePromoteProductionPromptResult {
  isOpen: boolean
  onDismiss: () => void
  onMarkProduction: () => void
}
