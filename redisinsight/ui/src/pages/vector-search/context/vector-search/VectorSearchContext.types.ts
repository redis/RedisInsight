import { SearchTelemetrySource } from '../../telemetry.constants'

export interface VectorSearchContextValue {
  openPickSampleDataModal: (source: SearchTelemetrySource) => void
  navigateToExistingDataFlow: (source: SearchTelemetrySource) => void
}

export interface VectorSearchProviderProps {
  children: React.ReactNode
}
