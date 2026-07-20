import { SAMPLE_DATASETS } from './data'
import { SampleArrayDataset } from './LoadSampleDataset.types'

export const DATASET_OPTIONS = SAMPLE_DATASETS.map(
  ({ collectionName, label }) => ({
    value: collectionName,
    label,
  }),
)

export const getDatasetInfo = (
  dataset: SampleArrayDataset,
): Array<{ label: string; value: string }> => [
  { label: 'Key', value: dataset.keyName },
  { label: 'Elements', value: `${dataset.elementCount}` },
  { label: 'Highest index', value: dataset.highestIndex },
  { label: 'Layout', value: dataset.description },
]
