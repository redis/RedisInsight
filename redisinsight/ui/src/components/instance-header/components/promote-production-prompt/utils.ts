import { ConnectionType } from 'uiSrc/slices/interfaces'

import {
  LOCAL_HOSTS,
  PRODUCTION_KEY_COUNT_THRESHOLD,
} from './PromoteProductionPrompt.constants'
import {
  ProductionHeuristicInput,
  ProductionSignals,
} from './PromoteProductionPrompt.types'

export const getProductionSignals = ({
  host,
  tls,
  connectionType,
  username,
  totalKeys,
}: ProductionHeuristicInput): ProductionSignals => ({
  hasKeyCountSignal: (totalKeys ?? 0) > PRODUCTION_KEY_COUNT_THRESHOLD,
  isRemoteHost: !!host && !LOCAL_HOSTS.includes(host.trim().toLowerCase()),
  hasTls: !!tls,
  isClustered:
    connectionType === ConnectionType.Cluster ||
    connectionType === ConnectionType.Sentinel,
  hasAuth: !!username,
})

// Needs the key-count signal AND one connection signal — key count alone would
// match a dev database loaded with sample data.
export const looksLikeProduction = (signals: ProductionSignals): boolean =>
  signals.hasKeyCountSignal &&
  (signals.isRemoteHost ||
    signals.hasTls ||
    signals.isClustered ||
    signals.hasAuth)
