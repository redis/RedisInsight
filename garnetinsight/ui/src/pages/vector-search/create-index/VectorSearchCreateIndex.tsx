import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { Stepper } from 'uiSrc/components/base/layout'
import { Title, Text } from 'uiSrc/components/base/text'
import { Button, SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { ChevronLeftIcon } from 'uiSrc/components/base/icons'

import { selectedBikesIndexFields, stepContents } from './steps'
import {
  CreateSearchIndexParameters,
  IStepNextButton,
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
  collectCreateIndexErrorStepTelemetry,
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
import { Row } from 'uiSrc/components/base/layout/flex'
import { Banner } from 'uiSrc/components/base/display'
import { useVectorSearchOnboarding } from 'uiSrc/pages/vector-search/context/VectorSearchOnboardingContext'

const stepNextButton: IStepNextButton[] = [
  {
    text: 'Proceed to adding data',
    testId: 'proceed-to-adding-data-button',
  },
  {
    text: 'Proceed to index',
    testId: 'proceed-to-index-button',
  },
  {
    text: 'Create index',
    testId: 'create-index-button',
  },
]

export type VectorSearchCreateIndexProps = {
  initialStep?: number
}

const DisabledDataEditingBannerText = () => (
  <Text component="div">
    Editing the index is not available for pre-set data. Click{' '}
    <Text variant="semiBold" component="span">
      Create index
    </Text>{' '}
    to continue.
  </Text>
)

export const VectorSearchCreateIndex = ({
  initialStep = 1,
}: VectorSearchCreateIndexProps) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { instanceId } = useParams<{ instanceId: string }>()
  const [step, setStep] = useState(initialStep)

  const { setOnboardingSeen } = useVectorSearchOnboarding()

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

  const isFinalStep = step === stepContents.length - 1
  const isPresetData =
    createSearchIndexParameters.sampleDataType === SampleDataType.PRESET_DATA
  const showDisabledDataEditingBanner = isFinalStep && isPresetData

  const setParameters = (params: Partial<CreateSearchIndexParameters>) => {
    setCreateSearchIndexParameters((prev) => ({ ...prev, ...params }))
  }
  const showBackButton = step > initialStep
  const StepContent = stepContents[step]
  const onNextClick = () => {
    if (isFinalStep) {
      createIndex(
        createSearchIndexParameters,
        () => {
          collectCreateIndexStepTelemetry(instanceId)
          setOnboardingSeen()
        },
        () => {
          collectCreateIndexErrorStepTelemetry(instanceId)
        },
      )
      return
    }

    setStep(step + 1)
  }

  const onBackClick = () => {
    setStep(step - 1)
  }

  const onCancelClick = () => {
    history.push(Pages.vectorSearch(instanceId))
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

      history.push({
        pathname: Pages.vectorSearch(instanceId),
        search: `?defaultSavedQueriesIndex=${encodeURIComponent(
          createSearchIndexParameters.indexName,
        )}`,
      })
    }
  }, [success, error])

  return (
    <VectorSearchScreenWrapper direction="column" justify="between">
      <VectorSearchScreenHeader direction="row" padding={8}>
        <Title size="M" data-testid="title">
          New vector search
        </Title>
        <Stepper currentStep={step - 1} title="test">
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
        <Row gap="m" grow={false} align="center">
          <Banner
            data-testid="disabled-data-editing-banner"
            show={showDisabledDataEditingBanner}
            message={<DisabledDataEditingBannerText />}
            variant="notice"
          />
          <SecondaryButton onClick={onCancelClick}>Cancel</SecondaryButton>
          <Button
            loading={loading}
            onClick={onNextClick}
            data-testid={stepNextButton[step].testId}
          >
            {stepNextButton[step].text}
          </Button>
        </Row>
      </VectorSearchScreenFooter>
    </VectorSearchScreenWrapper>
  )
}
