export interface SampleArrayDataset {
  collectionName: string
  keyName: string
  label: string
  description: string
  elementCount: number
  highestIndex: string
  previewRows: Array<{ index: string; value: string }>
}

export interface Props {
  dataset: SampleArrayDataset
  onDatasetChange: (dataset: SampleArrayDataset) => void
}
