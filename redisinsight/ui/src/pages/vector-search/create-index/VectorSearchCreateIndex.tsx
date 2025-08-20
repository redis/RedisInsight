import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { Stepper } from '@redis-ui/components'
import { Title } from 'uiSrc/components/base/text'
import { Button, SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { ChevronLeftIcon } from 'uiSrc/components/base/icons'

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
import {
  collectCreateIndexStepTelemetry,
  collectCreateIndexWizardTelemetry,
} from '../telemetry'
import { Pages } from 'uiSrc/constants'
import {
  addMessageNotification,
  addErrorNotification,
} from 'uiSrc/slices/app/notifications'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { parseCustomError } from 'uiSrc/utils'

const stepNextButtonTexts = [
  'Proceed to adding data',
  'Proceed to index',
  'Create index',
]

export type VectorSearchCreateIndexProps = {
  initialStep?: number
}

export const VectorSearchCreateIndex = ({
  initialStep = 1,
}: VectorSearchCreateIndexProps) => {
  const dispatch = useDispatch()
  const history = useHistory()
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

  const { run: createIndex, error, success, loading } = useCreateIndex()

  const setParameters = (params: Partial<CreateSearchIndexParameters>) => {
    setCreateSearchIndexParameters((prev) => ({ ...prev, ...params }))
  }
  const showBackButton = step > initialStep
  const StepContent = stepContents[step]
  const onNextClick = () => {
    const isFinalStep = step === stepContents.length - 1
    if (isFinalStep) {
      createIndex(createSearchIndexParameters)
      collectCreateIndexStepTelemetry(instanceId)
      return
    }

    setStep(step + 1)
  }
  const onBackClick = () => {
    setStep(step - 1)
  }

  useEffect(() => {
    collectCreateIndexWizardTelemetry({
      instanceId,
      step,
      parameters: createSearchIndexParameters,
    })
  }, [step])

  useEffect(() => {
    if (error) {
      dispatch(addErrorNotification(parseCustomError(error.message) as any))
    } else if (success) {
      dispatch(addMessageNotification(successMessages.CREATE_INDEX()))

      history.push(Pages.vectorSearch(instanceId), {
        openSavedQueriesPanel: true,
      })
    }
  }, [success, error])

  return (
    <VectorSearchScreenWrapper direction="column" justify="between">
      <VectorSearchScreenHeader direction="row" padding={8}>
        <Title size="M" data-testid="title">
          New vector search
        </Title>
        <Stepper currentStep={step} title="test">
          <Stepper.Step>Select a database</Stepper.Step>
          <Stepper.Step>Adding data</Stepper.Step>
          <Stepper.Step>Create Index</Stepper.Step>
        </Stepper>
      </VectorSearchScreenHeader>
      <VectorSearchScreenContent direction="column" grow={1} padding={8}>
        <StepContent
          parameters={createSearchIndexParameters}
          setParameters={setParameters}
        />
      </VectorSearchScreenContent>
      <VectorSearchScreenFooter direction="row" padding={8}>
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
