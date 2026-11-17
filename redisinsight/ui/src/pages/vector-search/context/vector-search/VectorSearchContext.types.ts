import { SearchTelemetrySource } from '../../telemetry.constants'

export interface VectorSearchContextValue {
  openPickSampleDataModal: (source: SearchTelemetrySource) => void
  navigateToExistingDataFlow: (source: SearchTelemetrySource) => void
  hasExistingKeys: boolean
  hasExistingKeysLoading: boolean
  hasExistingKeysError: boolean
}

export interface VectorSearchProviderProps {
  children: React.ReactNode
}
