import { SearchTelemetrySource } from '../../telemetry.constants'

export interface VectorSearchContextValue {
  openPickSampleDataModal: (source: SearchTelemetrySource) => void
  navigateToExistingDataFlow: (source: SearchTelemetrySource) => void
  // Legacy (pre dev-vs-enhancements) keys probe used to gate the "existing
  // data" entry points. Only meaningful while the flag is off.
  hasExistingKeys: boolean
  hasExistingKeysLoading: boolean
}

export interface VectorSearchProviderProps {
  children: React.ReactNode
}
