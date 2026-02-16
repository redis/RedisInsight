import { SampleDataContent } from '../components/pick-sample-data-modal/PickSampleDataModal.types'
import { IndexField } from '../components/index-details/IndexDetails.types'
import { SAMPLE_DATASETS } from '../constants'

/**
 * Preset index names for sample datasets.
 */
export enum PresetIndexName {
  BIKES = 'idx:bikes_vss',
  MOVIES = 'idx:movies_vss',
}

export const getIndexNameBySampleData = (
  sampleData: SampleDataContent,
): string => SAMPLE_DATASETS[sampleData].indexName

export const getFieldsBySampleData = (
  sampleData: SampleDataContent,
): IndexField[] => SAMPLE_DATASETS[sampleData].fields

export const getCollectionNameBySampleData = (
  sampleData: SampleDataContent,
): string => SAMPLE_DATASETS[sampleData].collectionName

export const getDisplayNameBySampleData = (
  sampleData: SampleDataContent,
): string => SAMPLE_DATASETS[sampleData].displayName

export const getIndexPrefixBySampleData = (
  sampleData: SampleDataContent,
): string => SAMPLE_DATASETS[sampleData].indexPrefix
