import React from 'react'

import i18n, { Trans } from 'uiSrc/i18n'
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

// Built at call time (not module scope) so titles/bodies resolve in the active
// language when the popover renders.
export const getStepContent = (): Record<
  CreateIndexOnboardingStep,
  StepContent
> => ({
  [CreateIndexOnboardingStep.DefineIndex]: {
    title: i18n.t('vectorSearch.onboarding.defineIndex.title'),
    body: (
      <>
        <Text size="m" color="secondary">
          {i18n.t('vectorSearch.onboarding.defineIndex.body1')}
        </Text>
        <Text size="m" color="secondary">
          {i18n.t('vectorSearch.onboarding.defineIndex.body2')}
        </Text>
        <Text size="m" color="secondary">
          {i18n.t('vectorSearch.onboarding.defineIndex.body3')}
        </Text>
      </>
    ),
  },
  [CreateIndexOnboardingStep.IndexPrefix]: {
    title: i18n.t('vectorSearch.onboarding.indexPrefix.title'),
    body: (
      <>
        <Text size="m" color="secondary">
          {i18n.t('vectorSearch.onboarding.indexPrefix.body1')}
        </Text>
        <Text size="m" color="secondary">
          <Trans
            i18nKey="vectorSearch.onboarding.indexPrefix.body2"
            components={{ bold: <strong /> }}
          />
        </Text>
      </>
    ),
  },
  [CreateIndexOnboardingStep.FieldName]: {
    title: i18n.t('vectorSearch.onboarding.fieldName.title'),
    body: (
      <Text size="m" color="secondary">
        {i18n.t('vectorSearch.onboarding.fieldName.body')}
      </Text>
    ),
  },
  [CreateIndexOnboardingStep.SampleValue]: {
    title: i18n.t('vectorSearch.onboarding.sampleValue.title'),
    body: (
      <Text size="m" color="secondary">
        {i18n.t('vectorSearch.onboarding.sampleValue.body')}
      </Text>
    ),
  },
  [CreateIndexOnboardingStep.IndexingType]: {
    title: i18n.t('vectorSearch.onboarding.indexingType.title'),
    body: <IndexingTypeContent />,
  },
  [CreateIndexOnboardingStep.CommandView]: {
    title: i18n.t('vectorSearch.onboarding.commandView.title'),
    body: (
      <Text size="m" color="secondary">
        {i18n.t('vectorSearch.onboarding.commandView.body')}
      </Text>
    ),
  },
})
