import { TFunction } from 'i18next'
import { SAMPLE_DATASETS } from './data'
import { SampleArrayDataset } from './LoadSampleDataset.types'

export const DATASET_OPTIONS = SAMPLE_DATASETS.map(
  ({ collectionName, label }) => ({
    value: collectionName,
    label,
  }),
)

// `testId` stays a stable English slug (used for keys and data-testids);
// `label` is localized at render.
export const getDatasetInfo = (
  dataset: SampleArrayDataset,
  t: TFunction,
): Array<{ testId: string; label: string; value: string }> => [
  {
    testId: 'key',
    label: t('browser.addKey.array.summary.key'),
    value: dataset.keyName,
  },
  {
    testId: 'elements',
    label: t('browser.addKey.array.summary.elements'),
    value: `${dataset.elementCount}`,
  },
  {
    testId: 'highest-index',
    label: t('browser.addKey.array.summary.highestIndex'),
    value: dataset.highestIndex,
  },
  {
    testId: 'layout',
    label: t('browser.addKey.array.summary.layout'),
    value: dataset.description,
  },
]
