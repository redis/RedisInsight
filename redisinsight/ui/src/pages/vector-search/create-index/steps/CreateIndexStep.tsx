import React, { useState } from 'react'

import CreateIndexStepWrapper, {
  IndexStepTab,
} from 'uiSrc/components/new-index/create-index-step'
import { FieldBoxesGroup } from 'uiSrc/components/new-index/create-index-step/field-boxes-group/FieldBoxesGroup'
import { VectorSearchBox } from 'uiSrc/components/new-index/create-index-step/field-box/types'
import { generateFtCreateCommand } from 'uiSrc/utils/index/generateFtCreateCommand'
import { VectorIndexTab } from 'uiSrc/components/new-index/create-index-step/CreateIndexStepWrapper'
import { BuildNewIndexTabTrigger } from 'uiSrc/components/new-index/create-index-step/build-new-index-tab/BuildNewIndexTabTrigger'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { PlayFilledIcon } from 'uiBase/icons'
import { bikesIndexFieldsBoxes } from './config'
import { CreateIndexStepScreenWrapper, SearchInputWrapper } from './styles'
import { PreviewCommandDrawer } from './PreviewCommandDrawer'
import { IStepComponent, StepComponentProps } from '../types'

import { RiTextInput } from 'uiBase/inputs'
import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiText } from 'uiBase/text'
import { RiEmptyButton } from 'uiBase/forms'

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
            <RiFlexItem direction="column" $gap="s" grow={1}>
              <RiText>Index name</RiText>
              <RiTextInput
                disabled
                placeholder="Search for index"
                autoComplete="off"
                value={parameters.indexName}
                onChange={(value) => setParameters({ indexName: value })}
                data-testid="search-for-index"
              />
            </RiFlexItem>
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
    <CreateIndexStepScreenWrapper>
      <RiFlexItem $gap="xxl">
        <RiFlexItem $gap="m">
          <RiText>Vector index</RiText>
          <RiText size="S" color="secondary">
            Indexes tell Redis how to search your data. Creating an index
            enables fast, accurate retrieval across your dataset.
          </RiText>
        </RiFlexItem>
        <CreateIndexStepWrapper
          defaultValue={VectorIndexTab.UsePresetIndex}
          tabs={indexFieldsTabs}
        />
        <RiRow justify="end">
          <RiEmptyButton
            icon={PlayFilledIcon}
            onClick={handlePreviewCommandClick}
            data-testid="preview-command-button"
          >
            Command preview
          </RiEmptyButton>
        </RiRow>
      </RiFlexItem>
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
