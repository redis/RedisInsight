import { IndexField } from '../../components/index-details/IndexDetails.types'

/**
 * Full configuration for a sample dataset.
 * To add a new dataset, create a new file in this directory implementing this interface,
 * then register it in the SAMPLE_DATASETS map in `index.ts`.
 */
export interface SampleDatasetConfig {
  /** Human-readable display name (e.g. "E-commerce discovery"). */
  displayName: string

  /** Index name used in the FT.CREATE command (e.g. "idx:bikes_vss"). */
  indexName: string

  /** Key prefix used in the FT.CREATE command (e.g. "bikes:"). */
  indexPrefix: string

  /** Collection name used for bulk data import via the API. */
  collectionName: string

  /** Index field definitions shown in the IndexDetails table. */
  fields: IndexField[]
}
