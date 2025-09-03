import React, { useState } from 'react'

import { FlexGroup, FlexItem } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import CreateIndexStepWrapper, {
  IndexStepTab,
} from 'uiSrc/components/new-index/create-index-step'
import { FieldBoxesGroup } from 'uiSrc/components/new-index/create-index-step/field-boxes-group/FieldBoxesGroup'
import { VectorSearchBox } from 'uiSrc/components/new-index/create-index-step/field-box/types'
import { generateFtCreateCommand } from 'uiSrc/utils/index/generateFtCreateCommand'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { VectorIndexTab } from 'uiSrc/components/new-index/create-index-step/CreateIndexStepWrapper'
import { BuildNewIndexTabTrigger } from 'uiSrc/components/new-index/create-index-step/build-new-index-tab/BuildNewIndexTabTrigger'
import { TextInput } from 'uiSrc/components/base/inputs'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { PlayFilledIcon } from 'uiSrc/components/base/icons'
import { bikesIndexFieldsBoxes } from './config'
import { CreateIndexStepScreenWrapper, SearchInputWrapper } from './styles'
import { PreviewCommandDrawer } from './PreviewCommandDrawer'
import { IStepComponent, StepComponentProps } from '../types'

// eslint-disable-next-line arrow-body-style, @typescript-eslint/no-unused-vars
const useIndexFieldsBoxes = (_indexName: string): VectorSearchBox[] => {
  return bikesIndexFieldsBoxes
}

export const CreateIndexStep: IStepComponent = ({
  parameters,
  setParameters,
}: StepComponentProps) => {
  const indexFieldsBoxes = useIndexFieldsBoxes(parameters.indexName)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const indexFieldsTabs: IndexStepTab[] = [
    {
      value: VectorIndexTab.BuildNewIndex,
      label: <BuildNewIndexTabTrigger />,
      disabled: true,
    },
    {
      value: VectorIndexTab.UsePresetIndex,
      label: 'Use preset index',
      disabled: false,
      content: (
        <>
          <SearchInputWrapper>
            <FlexItem direction="column" $gap="s" grow={1}>
              <Text>Index name</Text>
              <TextInput
                disabled
                placeholder="Search for index"
                autoComplete="off"
                value={parameters.indexName}
                onChange={(value) => setParameters({ indexName: value })}
                data-testid="search-for-index"
              />
            </FlexItem>
          </SearchInputWrapper>
          <FieldBoxesGroup
            boxes={indexFieldsBoxes}
            value={parameters.indexFields}
            onChange={(value) => setParameters({ indexFields: value })}
          />
        </>
      ),
    },
  ]

  const handlePreviewCommandClick = () => {
    setIsDrawerOpen(true)
    sendEventTelemetry({
      event: TelemetryEvent.VECTOR_SEARCH_ONBOARDING_VIEW_COMMAND_PREVIEW,
      eventData: {
        databaseId: parameters.instanceId,
      },
    })
  }

  return (
    <CreateIndexStepScreenWrapper as="div" data-testid="create-index-step2">
      <FlexItem direction="column" $gap="xxl">
        <FlexItem direction="column" $gap="m">
          <Text>Vector index</Text>
          <Text size="S" color="secondary">
            Indexes tell Redis how to search your data. Creating an index
            enables fast, accurate retrieval across your dataset.
          </Text>
        </FlexItem>
        <CreateIndexStepWrapper
          defaultValue={VectorIndexTab.UsePresetIndex}
          tabs={indexFieldsTabs}
        />
        <FlexGroup justify="end">
          <EmptyButton
            icon={PlayFilledIcon}
            onClick={handlePreviewCommandClick}
            data-testid="preview-command-button"
          >
            Command preview
          </EmptyButton>
        </FlexGroup>
      </FlexItem>
      <PreviewCommandDrawer
        commandContent={generateFtCreateCommand({
          indexName: parameters.indexName,
        })}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </CreateIndexStepScreenWrapper>
  )
}
