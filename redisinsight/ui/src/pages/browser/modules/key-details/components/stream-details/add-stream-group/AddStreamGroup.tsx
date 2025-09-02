import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { lastDeliveredIDTooltipText } from 'uiSrc/constants/texts'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { addNewGroupAction } from 'uiSrc/slices/browser/stream'
import {
  consumerGroupIdRegex,
  stringToBuffer,
  validateConsumerGroupId,
} from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { RiTooltip } from 'uiSrc/components'
import { TextInput } from 'uiSrc/components/base/inputs'
import { CreateConsumerGroupsDto } from 'apiSrc/modules/browser/stream/dto'

import { Panel } from 'uiSrc/components/panel'
import { Text } from 'uiSrc/components/base/text'
import {
  StreamGroupContent,
  TimeStampInfoIcon,
  TimeStampWrapper,
} from './AddStreamGroup.styles'

export interface Props {
  closePanel: (isCancelled?: boolean) => void
}

const AddStreamGroup = (props: Props) => {
  const { closePanel } = props
  const { name: keyName = '' } = useSelector(selectedKeyDataSelector) ?? {
    name: undefined,
  }

  const [isFormValid, setIsFormValid] = useState<boolean>(false)
  const [groupName, setGroupName] = useState<string>('')
  const [id, setId] = useState<string>('$')
  const [idError, setIdError] = useState<string>('')
  const [isIdFocused, setIsIdFocused] = useState<boolean>(false)

  const { instanceId } = useParams<{ instanceId: string }>()

  const dispatch = useDispatch()

  useEffect(() => {
    const isValid = !!groupName.length && !idError
    setIsFormValid(isValid)
  }, [groupName, idError])

  useEffect(() => {
    if (!consumerGroupIdRegex.test(id)) {
      setIdError('ID format is not correct')
      return
    }
    setIdError('')
  }, [id])

  const onSuccessAdded = () => {
    closePanel()
    sendEventTelemetry({
      event: TelemetryEvent.STREAM_CONSUMER_GROUP_CREATED,
      eventData: {
        databaseId: instanceId,
      },
    })
  }

  const submitData = () => {
    if (isFormValid) {
      const data: CreateConsumerGroupsDto = {
        keyName,
        consumerGroups: [
          {
            name: stringToBuffer(groupName),
            lastDeliveredId: id,
          },
        ],
      }
      dispatch(addNewGroupAction(data, onSuccessAdded))
    }
  }

  const showIdError = !isIdFocused && idError

  return (
    <Col gap="m">
      <StreamGroupContent data-test-subj="add-stream-groups-field-panel">
        <FlexItem grow>
          <Row gap="m">
            <FlexItem grow>
              <Row align="start" gap="m">
                <FlexItem grow={2}>
                  <FormField>
                    <TextInput
                      name="group-name"
                      id="group-name"
                      placeholder="Enter Group Name*"
                      value={groupName}
                      onChange={(value) => setGroupName(value)}
                      autoComplete="off"
                      data-testid="group-name-field"
                    />
                  </FormField>
                </FlexItem>
                <TimeStampWrapper>
                  <FormField
                    additionalText={
                      <Row align="center" gap="s">
                        <RiTooltip
                          anchorClassName="inputAppendIcon"
                          position="left"
                          title="Enter Valid ID, 0 or $"
                          content={lastDeliveredIDTooltipText}
                        >
                          <TimeStampInfoIcon data-testid="entry-id-info-icon" />
                        </RiTooltip>
                        {!showIdError && (
                          <Text
                            size="XS"
                            color="primary"
                            data-testid="id-help-text"
                          >
                            Timestamp - Sequence Number or $
                          </Text>
                        )}
                        {showIdError && (
                          <Text size="XS" color="danger" data-testid="id-error">
                            {idError}
                          </Text>
                        )}
                      </Row>
                    }
                  >
                    <TextInput
                      name="id"
                      id="id"
                      placeholder="ID*"
                      value={id}
                      onChange={(value) =>
                        setId(validateConsumerGroupId(value))
                      }
                      onBlur={() => setIsIdFocused(false)}
                      onFocus={() => setIsIdFocused(true)}
                      autoComplete="off"
                      data-testid="id-field"
                    />
                  </FormField>
                </TimeStampWrapper>
              </Row>
            </FlexItem>
          </Row>
        </FlexItem>
      </StreamGroupContent>
      <Panel justify="end" gap="m">
        <SecondaryButton
          onClick={() => closePanel(true)}
          data-testid="cancel-stream-groups-btn"
        >
          Cancel
        </SecondaryButton>
        <PrimaryButton
          onClick={submitData}
          disabled={!isFormValid}
          data-testid="save-groups-btn"
        >
          Save
        </PrimaryButton>
      </Panel>
    </Col>
  )
}

export default AddStreamGroup
