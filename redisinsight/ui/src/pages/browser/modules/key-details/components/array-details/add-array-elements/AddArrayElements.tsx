import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  selectedKeyDataSelector,
  keysSelector,
} from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { addArrayElements } from 'uiSrc/slices/browser/array'
import AddMultipleFields from 'uiSrc/pages/browser/components/add-multiple-fields'
import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { KeyTypes } from 'uiSrc/constants'
import { validateArrayIndex } from 'uiSrc/utils'
import { AddArrayFormConfig as config } from 'uiSrc/pages/browser/components/add-key/constants/fields-config'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { TextInput } from 'uiSrc/components/base/inputs'
import { EntryContent } from '../../common/AddKeysContainer.styled'

export interface Props {
  closePanel: (isCancelled?: boolean) => void
}

interface ArrayFieldState {
  id: number
  index: string
  value: string
}

const INITIAL_FIELD: ArrayFieldState = {
  id: 0,
  index: '0',
  value: '',
}

const AddArrayElements = (props: Props) => {
  const { closePanel } = props

  const [elements, setElements] = useState<ArrayFieldState[]>([INITIAL_FIELD])
  const { name: selectedKey = '' } = useSelector(selectedKeyDataSelector) ?? {
    name: undefined,
  }
  const { viewType } = useSelector(keysSelector)
  const { id: instanceId } = useSelector(connectedInstanceSelector)

  const indexInput = useRef<HTMLInputElement>(null)

  const dispatch = useDispatch()

  useEffect(() => {
    indexInput.current?.focus()
  }, [])

  const onSuccessAdded = () => {
    closePanel()
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_VALUE_ADDED,
        TelemetryEvent.TREE_VIEW_KEY_VALUE_ADDED,
      ),
      eventData: {
        databaseId: instanceId,
        keyType: KeyTypes.Array,
        numberOfAdded: elements.length,
      },
    })
  }

  const addField = () => {
    const lastElement = elements[elements.length - 1]
    setElements([
      ...elements,
      {
        id: lastElement.id + 1,
        index: `${lastElement.id + 1}`,
        value: '',
      },
    ])
  }

  const onClickRemove = (item: ArrayFieldState) => {
    if (elements.length === 1) {
      setElements([{ ...item, index: '0', value: '' }])
      return
    }

    setElements(elements.filter((element) => element.id !== item.id))
  }

  const isClearDisabled = (item: ArrayFieldState): boolean =>
    elements.length === 1 && item.index === '0' && !item.value.length

  const handleElementChange = (
    id: number,
    field: keyof Pick<ArrayFieldState, 'index' | 'value'>,
    value: string,
  ) => {
    setElements(
      elements.map((element) =>
        element.id === id
          ? {
              ...element,
              [field]: field === 'index' ? validateArrayIndex(value) : value,
            }
          : element,
      ),
    )
  }

  const submitData = (): void => {
    dispatch(
      addArrayElements(
        {
          keyName: selectedKey,
          elements,
        },
        onSuccessAdded,
      ),
    )
  }

  return (
    <Col gap="m">
      <EntryContent gap="m">
        <AddMultipleFields
          items={elements}
          onClickRemove={onClickRemove}
          onClickAdd={addField}
          isClearDisabled={isClearDisabled}
        >
          {(item, index) => (
            <Row align="center" gap="m">
              <FlexItem grow={1}>
                <FormField>
                  <TextInput
                    name={`array-index-${item.id}`}
                    id={`array-index-${item.id}`}
                    placeholder={config.index.placeholder}
                    value={item.index}
                    onChange={(value) =>
                      handleElementChange(item.id, 'index', value)
                    }
                    ref={index === 0 ? indexInput : null}
                    data-testid={`array-index-${index}`}
                  />
                </FormField>
              </FlexItem>
              <FlexItem grow={2}>
                <FormField>
                  <TextInput
                    name={`array-value-${item.id}`}
                    id={`array-value-${item.id}`}
                    placeholder={config.value.placeholder}
                    value={item.value}
                    onChange={(value) =>
                      handleElementChange(item.id, 'value', value)
                    }
                    data-testid={`array-value-${index}`}
                  />
                </FormField>
              </FlexItem>
            </Row>
          )}
        </AddMultipleFields>
      </EntryContent>
      <Row justify="end" gap="m">
        <FlexItem>
          <SecondaryButton
            onClick={() => closePanel(true)}
            data-testid="cancel-array-elements-btn"
          >
            Cancel
          </SecondaryButton>
        </FlexItem>
        <FlexItem>
          <PrimaryButton
            onClick={submitData}
            data-testid="save-array-elements-btn"
          >
            Save
          </PrimaryButton>
        </FlexItem>
      </Row>
    </Col>
  )
}

export default AddArrayElements
