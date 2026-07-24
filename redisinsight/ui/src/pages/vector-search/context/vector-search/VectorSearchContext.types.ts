import { SearchTelemetrySource } from '../../telemetry.constants'

export interface VectorSearchContextValue {
  openPickSampleDataModal: (source: SearchTelemetrySource) => void
  navigateToExistingDataFlow: (source: SearchTelemetrySource) => void
  // Legacy (pre dev-vs-enhancements) keys probe used to gate the "existing
  // data" entry points. Only meaningful while the flag is off.
  hasExistingKeys: boolean
  hasExistingKeysLoading: boolean
  // A failed/inconclusive probe should keep the entry available rather than
  // wrongly reporting "no keys", matching the create-index page.
  hasExistingKeysError: boolean
}

export interface VectorSearchProviderProps {
  children: React.ReactNode
}
