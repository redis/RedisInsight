import React from 'react'

import { Text } from 'uiSrc/components/base/text'
import { IndexingTypeContent } from '../field-type-list'

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
    body: (
      <>
        <Text size="m" color="secondary">
          An index defines how Redis searches and queries your data. The schema
          controls which fields are indexed, their types, and other
          configuration options.
        </Text>
        <Text size="m" color="secondary">
          Review the suggested index name. You{'\u2019'}ll use it when building
          queries.
        </Text>
        <Text size="m" color="secondary">
          Tip: Index only fields you plan to search or filter on.
        </Text>
      </>
    ),
  },
  [CreateIndexOnboardingStep.IndexPrefix]: {
    title: 'Index prefix',
    body: (
      <>
        <Text size="m" color="secondary">
          Controls which keys are included in the index. All keys starting with
          this prefix will be indexed.
        </Text>
        <Text size="m" color="secondary">
          Example: <strong>bike:</strong> will index <strong>bike:1</strong>,{' '}
          <strong>bike:road:3</strong>.
        </Text>
      </>
    ),
  },
  [CreateIndexOnboardingStep.FieldName]: {
    title: 'Field name',
    body: (
      <Text size="m" color="secondary">
        Represents a searchable attribute in your data. Only selected fields
        will be searchable.
      </Text>
    ),
  },
  [CreateIndexOnboardingStep.SampleValue]: {
    title: 'Sample value',
    body: (
      <Text size="m" color="secondary">
        A sample value from the data to be indexed. Use it to verify the field
        type and indexing choice.
      </Text>
    ),
  },
  [CreateIndexOnboardingStep.IndexingType]: {
    title: 'Indexing type & options',
    body: <IndexingTypeContent />,
  },
  [CreateIndexOnboardingStep.CommandView]: {
    title: 'Create index command',
    body: (
      <Text size="m" color="secondary">
        This is the FT.CREATE command Redis will run. Once executed, your data
        becomes searchable.
      </Text>
    ),
  },
}
