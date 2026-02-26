import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { RedisearchIndexKeyType } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

import { SampleDataContent } from '../../components/pick-sample-data-modal/PickSampleDataModal.types'

export enum CreateIndexTab {
  Table = 'table',
  Command = 'command',
}

export enum CreateIndexMode {
  SampleData = 'sampleData',
  ExistingData = 'existingData',
}

export interface SampleDataLocationState {
  sampleData: SampleDataContent
  mode?: CreateIndexMode.SampleData
}

export interface ExistingDataLocationState {
  mode: CreateIndexMode.ExistingData
  initialKey?: RedisResponseBuffer
  initialKeyType?: RedisearchIndexKeyType
}

export type CreateIndexLocationState =
  | SampleDataLocationState
  | ExistingDataLocationState
