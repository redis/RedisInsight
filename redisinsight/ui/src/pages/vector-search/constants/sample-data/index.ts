import { SampleDataContent } from '../../components/pick-sample-data-modal/PickSampleDataModal.types'
import { SampleDatasetConfig } from './types'
import { BIKES_DATASET } from './bikes'
import { MOVIES_DATASET } from './movies'

/**
 * Central registry of all sample datasets.
 * To add a new dataset:
 * 1. Create a new file in this directory (e.g. `my-dataset.ts`)
 *    exporting a `SampleDatasetConfig`.
 * 2. Add a new entry to `SampleDataContent` enum.
 * 3. Register the config in this map.
 */
export const SAMPLE_DATASETS: Record<SampleDataContent, SampleDatasetConfig> = {
  [SampleDataContent.E_COMMERCE_DISCOVERY]: BIKES_DATASET,
  [SampleDataContent.CONTENT_RECOMMENDATIONS]: MOVIES_DATASET,
}

export { BIKES_DATASET, MOVIES_DATASET }
export type { SampleDatasetConfig } from './types'
