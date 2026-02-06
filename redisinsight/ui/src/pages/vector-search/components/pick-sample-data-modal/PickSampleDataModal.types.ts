export enum SampleDataContent {
  E_COMMERCE_DISCOVERY = 'e-commerce-discovery',
  CONTENT_RECOMMENDATIONS = 'content-recommendations',
}

export interface SampleDataOption {
  value: SampleDataContent
  label: string
  description: string
}

export interface PickSampleDataModalProps {
  isOpen: boolean
  selectedDataset: SampleDataContent | null
  onSelectDataset: (value: SampleDataContent) => void
  onCancel: () => void
  onSeeIndexDefinition: (selectedDataset: SampleDataContent) => void
  onStartQuerying: (selectedDataset: SampleDataContent) => void
}
