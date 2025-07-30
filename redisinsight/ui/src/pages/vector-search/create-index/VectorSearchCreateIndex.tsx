import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

import { Stepper } from '@redis-ui/components'
import { Title } from 'uiSrc/components/base/text'
import { Button, SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { ChevronLeftIcon } from 'uiSrc/components/base/icons'

import { stepContents } from './steps'
import {
  CreateIndexContent,
  CreateIndexFooter,
  CreateIndexHeader,
  CreateIndexWrapper,
} from './styles'
import {
  CreateSearchIndexParameters,
  SampleDataContent,
  SampleDataType,
  SearchIndexType,
} from './types'

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
      presetVectorIndexName: '',
      tags: [],
    })

  const setParameters = (params: Partial<CreateSearchIndexParameters>) => {
    setCreateSearchIndexParameters((prev) => ({ ...prev, ...params }))
  }
  const showBackButton = step > initialStep
  const StepContent = stepContents[step]
  const onNextClick = () => {
    const isFinalStep = step === stepContents.length - 1
    if (isFinalStep) {
      alert(
        `TODO: trigger index creation for params: ${JSON.stringify(createSearchIndexParameters)}`,
      )
      return
    }

    setStep(step + 1)
  }
  const onBackClick = () => {
    setStep(step - 1)
  }

  return (
    <CreateIndexWrapper direction="column" justify="between">
      <CreateIndexHeader direction="row">
        <Title size="M" data-testid="title">
          New vector search
        </Title>
        <Stepper currentStep={step} title="test">
          <Stepper.Step>Select a database</Stepper.Step>
          <Stepper.Step>Adding data</Stepper.Step>
          <Stepper.Step>Create Index</Stepper.Step>
        </Stepper>
      </CreateIndexHeader>
      <CreateIndexContent direction="column" grow={1}>
        <StepContent setParameters={setParameters} />
      </CreateIndexContent>
      <CreateIndexFooter direction="row">
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
        <Button onClick={onNextClick}>{stepNextButtonTexts[step]}</Button>
      </CreateIndexFooter>
    </CreateIndexWrapper>
  )
}
