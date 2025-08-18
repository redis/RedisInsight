import cx from 'classnames'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiPrimaryButton, RiSecondaryButton, RiFormField } from 'uiBase/forms'
import { RiIcon } from 'uiBase/icons'
import { RiTextInput } from 'uiBase/inputs'
import { RiTooltip } from 'uiBase/display'
import { lastDeliveredIDTooltipText } from 'uiSrc/constants/texts'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { addNewGroupAction } from 'uiSrc/slices/browser/stream'
import {
  consumerGroupIdRegex,
  stringToBuffer,
  validateConsumerGroupId,
} from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { CreateConsumerGroupsDto } from 'apiSrc/modules/browser/stream/dto'

import styles from './styles.module.scss'

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
    <>
      <div
        className={styles.content}
        data-test-subj="add-stream-groups-field-panel"
      >
        <RiFlexItem
          className={cx('flexItemNoFullWidth', 'inlineFieldsNoSpace')}
          grow
        >
          <RiRow>
            <RiFlexItem grow>
              <RiRow align="start">
                <RiFlexItem className={styles.groupNameWrapper} grow>
                  <RiFormField>
                    <RiTextInput
                      name="group-name"
                      id="group-name"
                      placeholder="Enter Group Name*"
                      value={groupName}
                      onChange={(value) => setGroupName(value)}
                      autoComplete="off"
                      data-testid="group-name-field"
                    />
                  </RiFormField>
                </RiFlexItem>
                <RiFlexItem className={styles.timestampWrapper} grow>
                  <RiFormField
                    additionalText={
                      <RiTooltip
                        anchorClassName="inputAppendIcon"
                        className={styles.entryIdTooltip}
                        position="left"
                        title="Enter Valid ID, 0 or $"
                        content={lastDeliveredIDTooltipText}
                      >
                        <RiIcon
                          type="InfoIcon"
                          style={{ cursor: 'pointer' }}
                          data-testid="entry-id-info-icon"
                        />
                      </RiTooltip>
                    }
                  >
                    <RiTextInput
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
                  </RiFormField>
                  {!showIdError && (
                    <span className={styles.idText} data-testid="id-help-text">
                      Timestamp - Sequence Number or $
                    </span>
                  )}
                  {showIdError && (
                    <span className={styles.error} data-testid="id-error">
                      {idError}
                    </span>
                  )}
                </RiFlexItem>
              </RiRow>
            </RiFlexItem>
          </RiRow>
        </RiFlexItem>
      </div>
      <>
        <RiRow justify="end" gap="l" style={{ padding: 18 }}>
          <RiFlexItem>
            <div>
              <RiSecondaryButton
                onClick={() => closePanel(true)}
                data-testid="cancel-stream-groups-btn"
              >
                Cancel
              </RiSecondaryButton>
            </div>
          </RiFlexItem>
          <RiFlexItem>
            <div>
              <RiPrimaryButton
                onClick={submitData}
                disabled={!isFormValid}
                data-testid="save-groups-btn"
              >
                Save
              </RiPrimaryButton>
            </div>
          </RiFlexItem>
        </RiRow>
      </>
    </>
  )
}

export default AddStreamGroup
