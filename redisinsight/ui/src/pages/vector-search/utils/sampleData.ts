import i18n from 'uiSrc/i18n'
import { SampleDataContent } from '../components/pick-sample-data-modal/PickSampleDataModal.types'
import { IndexField } from '../components/index-details/IndexDetails.types'
import { SampleQuery } from '../constants/sample-data/types'
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
): string => i18n.t(SAMPLE_DATASETS[sampleData].displayName as never)

export const getIndexPrefixBySampleData = (
  sampleData: SampleDataContent,
): string => SAMPLE_DATASETS[sampleData].indexPrefix

// Returns raw sample queries whose name/description are i18n keys. They are
// seeded into the Query Library as keys (see seedSampleQueries) and translated
// on the fly when displayed, so seeded items follow runtime language changes.
export const getSampleQueriesBySampleData = (
  sampleData: SampleDataContent,
): SampleQuery[] => SAMPLE_DATASETS[sampleData].sampleQueries
