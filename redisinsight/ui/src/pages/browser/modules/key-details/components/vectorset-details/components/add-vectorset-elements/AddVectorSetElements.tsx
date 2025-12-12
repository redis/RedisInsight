import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  keysSelector,
  selectedKeyDataSelector,
} from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  addVectorSetElements,
  vectorsetSelector,
} from 'uiSrc/slices/browser/vectorset'
import { KeyTypes } from 'uiSrc/constants'
import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import AddMultipleFields from 'uiSrc/pages/browser/components/add-multiple-fields'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { TextInput } from 'uiSrc/components/base/inputs'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { AppDispatch } from 'uiSrc/slices/store'

import { EntryContent } from 'uiSrc/pages/browser/modules/key-details/components/common/AddKeysContainer.styled'
import type {
  AddVectorSetElementsProps,
  VectorSetElementStateType,
} from './AddVectorSetElements.types'
import { INITIAL_VECTORSET_ELEMENT_STATE } from './AddVectorSetElements.types'
import { parseVectorInput } from '../../utils'

const AddVectorSetElements = ({ closePanel }: AddVectorSetElementsProps) => {
  const dispatch = useDispatch<AppDispatch>()

  const [elements, setElements] = useState<VectorSetElementStateType[]>([
    { ...INITIAL_VECTORSET_ELEMENT_STATE },
  ])

  const { loading } = useSelector(vectorsetSelector)
  const { name: selectedKey } = useSelector(selectedKeyDataSelector) ?? {}
  const { viewType } = useSelector(keysSelector)
  const { id: instanceId } = useSelector(connectedInstanceSelector)

  const lastAddedElementName = useRef<HTMLInputElement>(null)

  useEffect(() => {
    lastAddedElementName.current?.focus()
  }, [elements.length])

  const parseAttributes = (input: string): Record<string, unknown> | null => {
    if (!input.trim()) return null
    try {
      const parsed = JSON.parse(input)
      if (typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed
      }
      return null
    } catch {
      return null
    }
  }

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
        keyType: KeyTypes.VectorSet,
        numberOfAdded: elements.length,
      },
    })
  }

  const addElement = () => {
    const lastElement = elements[elements.length - 1]
    const newState = [
      ...elements,
      {
        ...INITIAL_VECTORSET_ELEMENT_STATE,
        id: lastElement.id + 1,
      },
    ]
    setElements(newState)
  }

  const removeElement = (id: number) => {
    const newState = elements.filter((item) => item.id !== id)
    setElements(newState)
  }

  const clearElementValues = (id: number) => {
    const newState = elements.map((item) =>
      item.id === id
        ? {
            ...item,
            name: '',
            vector: '',
            attributes: '',
          }
        : item,
    )
    setElements(newState)
  }

  const onClickRemove = ({ id }: VectorSetElementStateType) => {
    if (elements.length === 1) {
      clearElementValues(id)
      return
    }
    removeElement(id)
  }

  const handleElementChange = (
    formField: string,
    id: number,
    value: string,
  ) => {
    const newState = elements.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          [formField]: value,
        }
      }
      return item
    })
    setElements(newState)
  }

  const isFormValid = elements.every(
    (item) => item.name.trim() && parseVectorInput(item.vector),
  )

  const submitData = (): void => {
    if (!selectedKey) return

    const data = {
      keyName: selectedKey,
      elements: elements.map((item) => {
        const element: {
          name: string
          vector: number[]
          attributes?: Record<string, unknown>
        } = {
          name: item.name,
          vector: parseVectorInput(item.vector) || [],
        }
        const attrs = parseAttributes(item.attributes)
        if (attrs) {
          element.attributes = attrs
        }
        return element
      }),
    }

    dispatch(addVectorSetElements(data, onSuccessAdded))
  }

  const isClearDisabled = (item: VectorSetElementStateType): boolean =>
    elements.length === 1 &&
    !(item.name.length || item.vector.length || item.attributes.length)

  return (
    <Col gap="m">
      <EntryContent>
        <AddMultipleFields
          items={elements}
          isClearDisabled={isClearDisabled}
          onClickRemove={onClickRemove}
          onClickAdd={addElement}
        >
          {(item, index) => (
            <Col gap="s">
              <Row align="center" gap="m">
                <FlexItem grow>
                  <FormField label="Element Name">
                    <TextInput
                      name={`element-name-${item.id}`}
                      id={`element-name-${item.id}`}
                      placeholder="Enter element name"
                      value={item.name}
                      onChange={(value) =>
                        handleElementChange('name', item.id, value)
                      }
                      ref={
                        index === elements.length - 1
                          ? lastAddedElementName
                          : null
                      }
                      disabled={loading}
                      data-testid="vectorset-element-name"
                    />
                  </FormField>
                </FlexItem>
              </Row>
              <Row align="center" gap="m">
                <FlexItem grow>
                  <FormField label="Vector">
                    <TextInput
                      name={`element-vector-${item.id}`}
                      id={`element-vector-${item.id}`}
                      placeholder="[1.0, 2.0, 3.0] or 1.0, 2.0, 3.0"
                      value={item.vector}
                      onChange={(value) =>
                        handleElementChange('vector', item.id, value)
                      }
                      disabled={loading}
                      data-testid="vectorset-element-vector"
                    />
                  </FormField>
                </FlexItem>
              </Row>
              <Row align="center" gap="m">
                <FlexItem grow>
                  <FormField label="Attributes (optional)">
                    <TextInput
                      name={`element-attributes-${item.id}`}
                      id={`element-attributes-${item.id}`}
                      placeholder='{"key": "value"}'
                      value={item.attributes}
                      onChange={(value) =>
                        handleElementChange('attributes', item.id, value)
                      }
                      disabled={loading}
                      data-testid="vectorset-element-attributes"
                    />
                  </FormField>
                </FlexItem>
              </Row>
            </Col>
          )}
        </AddMultipleFields>
      </EntryContent>
      <Row justify="end" gap="xl">
        <FlexItem>
          <SecondaryButton
            size="small"
            onClick={() => closePanel(true)}
            disabled={loading}
            data-testid="cancel-vectorset-elements-btn"
          >
            Cancel
          </SecondaryButton>
        </FlexItem>
        <FlexItem>
          <PrimaryButton
            size="small"
            onClick={submitData}
            disabled={loading || !isFormValid}
            data-testid="save-vectorset-elements-btn"
          >
            Add
          </PrimaryButton>
        </FlexItem>
      </Row>
    </Col>
  )
}

export { AddVectorSetElements }
