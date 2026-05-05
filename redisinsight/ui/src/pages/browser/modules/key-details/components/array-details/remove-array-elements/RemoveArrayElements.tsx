import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Text } from 'uiSrc/components/base/text'
import { KeyTypes } from 'uiSrc/constants'
import { validateArrayIndex } from 'uiSrc/utils'
import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import {
  keysSelector,
  selectedKeyDataSelector,
} from 'uiSrc/slices/browser/keys'
import {
  deleteArrayElementsAction,
  deleteArrayRangesAction,
} from 'uiSrc/slices/browser/array'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { AddArrayFormConfig as config } from 'uiSrc/pages/browser/components/add-key/constants/fields-config'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { TextInput } from 'uiSrc/components/base/inputs'
import { EntryContent } from '../../common/AddKeysContainer.styled'

export interface Props {
  closePanel: (isCancelled?: boolean) => void
  onRemoveKey: () => void
}

enum RemoveMode {
  Indexes = 'indexes',
  Range = 'range',
}

const removeModeOptions = [
  {
    value: RemoveMode.Indexes,
    inputDisplay: 'Remove indexes',
    label: 'Remove indexes',
  },
  {
    value: RemoveMode.Range,
    inputDisplay: 'Remove range',
    label: 'Remove range',
  },
]

const parseIndexes = (value: string): string[] =>
  value
    .split(',')
    .map((index) => validateArrayIndex(index.trim()))
    .filter(Boolean)

const RemoveArrayElements = (props: Props) => {
  const { closePanel, onRemoveKey } = props

  const [mode, setMode] = useState<RemoveMode>(RemoveMode.Indexes)
  const [indexes, setIndexes] = useState<string>('')
  const [rangeStart, setRangeStart] = useState<string>('0')
  const [rangeEnd, setRangeEnd] = useState<string>('0')

  const { name: selectedKey = '' } = useSelector(selectedKeyDataSelector) ?? {
    name: undefined,
  }
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewType } = useSelector(keysSelector)

  const indexesInput = useRef<HTMLInputElement>(null)

  const dispatch = useDispatch()

  useEffect(() => {
    indexesInput.current?.focus()
  }, [])

  const onSuccessRemoved = (newTotal: number) => {
    if (newTotal <= 0) onRemoveKey()
    closePanel()
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_VALUE_REMOVED,
        TelemetryEvent.TREE_VIEW_KEY_VALUE_REMOVED,
      ),
      eventData: {
        databaseId: instanceId,
        keyType: KeyTypes.Array,
        numberOfRemoved:
          mode === RemoveMode.Indexes ? parseIndexes(indexes).length : 1,
      },
    })
  }

  const submitData = (): void => {
    if (mode === RemoveMode.Indexes) {
      dispatch(
        deleteArrayElementsAction(
          selectedKey,
          parseIndexes(indexes),
          onSuccessRemoved,
        ),
      )
      return
    }

    dispatch(
      deleteArrayRangesAction(
        selectedKey,
        [{ start: rangeStart, end: rangeEnd }],
        onSuccessRemoved,
      ),
    )
  }

  const isFormValid =
    mode === RemoveMode.Indexes
      ? parseIndexes(indexes).length > 0
      : !!rangeStart && !!rangeEnd

  return (
    <Col gap="m">
      <EntryContent gap="m">
        <FlexItem>
          <RiSelect
            value={mode}
            options={removeModeOptions}
            onChange={(value) => setMode(value as RemoveMode)}
            data-testid="array-remove-mode"
          />
        </FlexItem>
        {mode === RemoveMode.Indexes ? (
          <FormField>
            <TextInput
              name="array-indexes"
              id="array-indexes"
              placeholder="Enter indexes separated by commas"
              value={indexes}
              onChange={setIndexes}
              ref={indexesInput}
              data-testid="array-indexes"
            />
          </FormField>
        ) : (
          <Row align="center" gap="m">
            <FlexItem grow>
              <FormField>
                <TextInput
                  name="array-range-start"
                  id="array-range-start"
                  placeholder={config.index.placeholder}
                  value={rangeStart}
                  onChange={(value) => setRangeStart(validateArrayIndex(value))}
                  data-testid="array-range-start"
                />
              </FormField>
            </FlexItem>
            <FlexItem grow>
              <FormField>
                <TextInput
                  name="array-range-end"
                  id="array-range-end"
                  placeholder={config.index.placeholder}
                  value={rangeEnd}
                  onChange={(value) => setRangeEnd(validateArrayIndex(value))}
                  data-testid="array-range-end"
                />
              </FormField>
            </FlexItem>
          </Row>
        )}
        <Text size="s" color="subdued">
          Removing the final populated element deletes the Array key.
        </Text>
      </EntryContent>
      <Row justify="end" gap="m">
        <FlexItem>
          <SecondaryButton
            onClick={() => closePanel(true)}
            data-testid="cancel-remove-array-elements-btn"
          >
            Cancel
          </SecondaryButton>
        </FlexItem>
        <FlexItem>
          <PrimaryButton
            onClick={submitData}
            disabled={!isFormValid}
            data-testid="remove-array-elements-btn"
          >
            Remove
          </PrimaryButton>
        </FlexItem>
      </Row>
    </Col>
  )
}

export default RemoveArrayElements
