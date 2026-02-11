import { SampleDataContent } from '../../components/pick-sample-data-modal/PickSampleDataModal.types'

export enum CreateIndexTab {
  Table = 'table',
  Command = 'command',
}

export interface CreateIndexLocationState {
  sampleData?: SampleDataContent
}
