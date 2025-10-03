import React, { useState } from 'react'

import {
  Col,
  FlexGroup,
  FlexItem,
  Row,
} from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { FieldBoxesGroup } from 'uiSrc/components/new-index/create-index-step/field-boxes-group/FieldBoxesGroup'
import { VectorSearchBox } from 'uiSrc/components/new-index/create-index-step/field-box/types'
import { generateFtCreateCommand } from 'uiSrc/utils/index/generateFtCreateCommand'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { TextInput } from 'uiSrc/components/base/inputs'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { PlayFilledIcon } from 'uiSrc/components/base/icons'
import { bikesIndexFieldsBoxes, moviesIndexFieldsBoxes } from './data'
import { SearchInputWrapper } from './styles'
import { PreviewCommandDrawer } from './PreviewCommandDrawer'
import { IStepComponent, SampleDataContent, StepComponentProps } from '../types'
import { NamespacesBrowser } from '../../components/namespaces-browser/NameSpacesBrowser'

// eslint-disable-next-line arrow-body-style, @typescript-eslint/no-unused-vars
const useIndexFieldsBoxes = (
  dataContent: SampleDataContent,
): VectorSearchBox[] => {
  if (dataContent === SampleDataContent.CONTENT_RECOMMENDATIONS) {
    return moviesIndexFieldsBoxes
  }

  return bikesIndexFieldsBoxes
}

export const CreateIndexStep: IStepComponent = ({
  parameters,
  setParameters,
}: StepComponentProps) => {
  const indexFieldsBoxes = useIndexFieldsBoxes(parameters.dataContent)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

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
    <FlexGroup direction="column" data-testid="create-index-step2">
      <Row justify="between" gap="xxl">
        <Col>
          <NamespacesBrowser />
        </Col>
        <Col gap="xxl" grow>
          <FlexItem direction="column" $gap="m">
            <Text>Create index</Text>
            <Text size="S" color="secondary">
              Indexes tell Redis how to search your data. Creating an index
              enables fast, accurate retrieval across your dataset.
            </Text>
          </FlexItem>
          <FlexGroup direction="column" gap="xxl">
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
          </FlexGroup>
        </Col>
        {/* <FlexGroup justify="end" grow={false}>
          <EmptyButton
            icon={PlayFilledIcon}
            onClick={handlePreviewCommandClick}
            data-testid="preview-command-button"
          >
            Command preview
          </EmptyButton>
        </FlexGroup> */}
      </Row>
      <PreviewCommandDrawer
        commandContent={generateFtCreateCommand({
          indexName: parameters.indexName,
          dataContent: parameters.dataContent,
        })}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </FlexGroup>
  )
}
