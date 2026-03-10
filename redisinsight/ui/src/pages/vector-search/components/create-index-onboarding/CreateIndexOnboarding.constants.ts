import React from 'react'

import { Text } from 'uiSrc/components/base/text'
import { IndexingTypeContent } from './IndexingTypeContent'

export enum CreateIndexOnboardingStep {
  DefineIndex = 'defineIndex',
  IndexPrefix = 'indexPrefix',
  FieldName = 'fieldName',
  SampleValue = 'sampleValue',
  IndexingType = 'indexingType',
  CommandView = 'commandView',
}

export const ONBOARDING_STEPS = [
  CreateIndexOnboardingStep.DefineIndex,
  CreateIndexOnboardingStep.IndexPrefix,
  CreateIndexOnboardingStep.FieldName,
  CreateIndexOnboardingStep.SampleValue,
  CreateIndexOnboardingStep.IndexingType,
  CreateIndexOnboardingStep.CommandView,
] as const

export const TOTAL_STEPS = ONBOARDING_STEPS.length

export interface StepContent {
  title: string
  body: React.ReactNode
}

export const STEP_CONTENT: Record<CreateIndexOnboardingStep, StepContent> = {
  [CreateIndexOnboardingStep.DefineIndex]: {
    title: 'Review and adjust the indexing schema',
    body: [
      'An index defines how Redis searches and queries your data. The schema controls which fields are indexed, their types, and other configuration options.',
      'Review the suggested index name. You\u2019ll use it when building queries.',
      'Tip: Index only fields you plan to search or filter on.',
    ],
  },
  [CreateIndexOnboardingStep.IndexPrefix]: {
    title: 'Index prefix',
    body: [
      'Controls which keys are included in the index. All keys starting with this prefix will be indexed.',
      React.createElement(
        Text,
        { size: 'm', color: 'secondary', children: null },
        'Example: ',
        React.createElement('strong', null, 'bike:'),
        ' will index ',
        React.createElement('strong', null, 'bike:1'),
        ', ',
        React.createElement('strong', null, 'bike:road:3'),
        '.',
      ),
    ],
  },
  [CreateIndexOnboardingStep.FieldName]: {
    title: 'Field name',
    body: 'Represents a searchable attribute in your data. Only selected fields will be searchable.',
  },
  [CreateIndexOnboardingStep.SampleValue]: {
    title: 'Sample value',
    body: 'A sample value from the data to be indexed. Use it to verify the field type and indexing choice.',
  },
  [CreateIndexOnboardingStep.IndexingType]: {
    title: 'Indexing type & options',
    body: [
      'Defines how Redis searches this field and how it behaves at query time. Available indexing types:',
      React.createElement(IndexingTypeContent),
      'Optional settings may affect performance, storage, or ranking.',
    ],
  },
  [CreateIndexOnboardingStep.CommandView]: {
    title: 'Create index command',
    body: 'This is the FT.CREATE command Redis will run. Once executed, your data becomes searchable.',
  },
}
