export enum SearchIndexType {
  REDIS_QUERY_ENGINE = 'redis_query_engine',
  VECTOR_SET = 'vector_set',
}

export enum SampleDataType {
  PRESET_DATA = 'preset_data',
  CUSTOM_DATA = 'custom_data',
}

export enum SampleDataContent {
  E_COMMERCE_DISCOVERY = 'e-commerce-discovery',
  CONTENT_RECOMMENDATIONS = 'content-recommendations',
}

export enum PresetDataType {
  BIKES = 'idx:bikes_vss',
  MOVIES = 'idx:movies_vss',
}

export type CreateSearchIndexParameters = {
  // Select a database step
  instanceId: string

  // Adding data step
  searchIndexType: SearchIndexType
  sampleDataType: SampleDataType
  dataContent: SampleDataContent

  // Create index step
  usePresetVectorIndex: boolean
  indexName: string
  indexFields: string[]
}

export type StepComponentProps = {
  setParameters: (params: Partial<CreateSearchIndexParameters>) => void
  parameters: CreateSearchIndexParameters
}

export interface IStepComponent {
  (props: StepComponentProps): JSX.Element | null
}

export interface IStepNextButton {
  text: string
  testId: string
}
