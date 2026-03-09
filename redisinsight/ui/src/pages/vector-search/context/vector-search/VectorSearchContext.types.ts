export interface VectorSearchContextValue {
  openPickSampleDataModal: () => void
  navigateToExistingDataFlow: () => void
  hasExistingKeys: boolean
  hasExistingKeysLoading: boolean
}

export interface VectorSearchProviderProps {
  children: React.ReactNode
}
