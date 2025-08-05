import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { Stepper } from '@redis-ui/components'
import { Title } from 'uiSrc/components/base/text'
import { Button, SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { ChevronLeftIcon } from 'uiSrc/components/base/icons'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { selectedBikesIndexFields, stepContents } from './steps'
import {
  CreateSearchIndexParameters,
  PresetDataType,
  SampleDataContent,
  SampleDataType,
  SearchIndexType,
} from './types'
import { useCreateIndex } from './hooks/useCreateIndex'
import {
  VectorSearchScreenContent,
  VectorSearchScreenFooter,
  VectorSearchScreenHeader,
  VectorSearchScreenWrapper,
} from '../styles'

const stepNextButtonTexts = [
  'Proceed to adding data',
  'Proceed to index',
  'Create index',
]

type VectorSearchCreateIndexProps = {
  initialStep?: number
}

export const VectorSearchCreateIndex = ({
  initialStep = 1,
}: VectorSearchCreateIndexProps) => {
  const { instanceId } = useParams<{ instanceId: string }>()
  const [step, setStep] = useState(initialStep)
  const [createSearchIndexParameters, setCreateSearchIndexParameters] =
    useState<CreateSearchIndexParameters>({
      instanceId,
      searchIndexType: SearchIndexType.REDIS_QUERY_ENGINE,
      sampleDataType: SampleDataType.PRESET_DATA,
      dataContent: SampleDataContent.E_COMMERCE_DISCOVERY,
      usePresetVectorIndex: true,
      indexName: PresetDataType.BIKES,
      indexFields: selectedBikesIndexFields,
    })

  const { run: createIndex, success, loading } = useCreateIndex()

  const setParameters = (params: Partial<CreateSearchIndexParameters>) => {
    setCreateSearchIndexParameters((prev) => ({ ...prev, ...params }))
  }
  const showBackButton = step > initialStep
  const StepContent = stepContents[step]
  const onNextClick = () => {
    const isFinalStep = step === stepContents.length - 1
    if (isFinalStep) {
      createIndex(createSearchIndexParameters)
      return
    }

    setStep(step + 1)
  }
  const onBackClick = () => {
    setStep(step - 1)
  }

  useEffect(() => {
    collectTelemetry(step)
  }, [step])

  const collectTelemetry = (step: number): void => {
    switch (step) {
      case 1:
        collectStartStepTelemetry()
        break
      case 2:
        collectIndexInfoStepTelemetry()
        break
      default:
        // No telemetry for other steps
        break
    }
  }

  const collectStartStepTelemetry = (): void => {
    sendEventTelemetry({
      event: TelemetryEvent.VECTOR_SEARCH_ONBOARDING_TRIGGERED,
      eventData: {
        databaseId: instanceId,
      },
    })
  }

  const collectIndexInfoStepTelemetry = (): void => {
    sendEventTelemetry({
      event: TelemetryEvent.VECTOR_SEARCH_ONBOARDING_PROCEED_TO_INDEX_INFO,
      eventData: {
        databaseId: instanceId,
        indexType: createSearchIndexParameters.searchIndexType,
        sampleDataType: createSearchIndexParameters.sampleDataType,
        dataContent: createSearchIndexParameters.dataContent,
      },
    })
  }

  if (success) {
    return <>Success!</>
  }

  return (
    <VectorSearchScreenWrapper direction="column" justify="between">
      <VectorSearchScreenHeader direction="row">
        <Title size="M" data-testid="title">
          New vector search
        </Title>
        <Stepper currentStep={step} title="test">
          <Stepper.Step>Select a database</Stepper.Step>
          <Stepper.Step>Adding data</Stepper.Step>
          <Stepper.Step>Create Index</Stepper.Step>
        </Stepper>
      </VectorSearchScreenHeader>
      <VectorSearchScreenContent direction="column" grow={1}>
        <StepContent
          parameters={createSearchIndexParameters}
          setParameters={setParameters}
        />
      </VectorSearchScreenContent>
      <VectorSearchScreenFooter direction="row">
        {showBackButton && (
          <SecondaryButton
            iconSide="left"
            icon={ChevronLeftIcon}
            onClick={onBackClick}
          >
            Back
          </SecondaryButton>
        )}
        <div />
        <Button loading={loading} onClick={onNextClick}>
          {stepNextButtonTexts[step]}
        </Button>
      </VectorSearchScreenFooter>
    </VectorSearchScreenWrapper>
  )
}
