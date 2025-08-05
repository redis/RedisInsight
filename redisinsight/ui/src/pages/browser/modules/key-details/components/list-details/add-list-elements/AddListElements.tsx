import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  selectedKeyDataSelector,
  keysSelector,
} from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { insertListElementsAction } from 'uiSrc/slices/browser/list'
import AddMultipleFields from 'uiSrc/pages/browser/components/add-multiple-fields'
import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { KeyTypes } from 'uiSrc/constants'
import { stringToBuffer } from 'uiSrc/utils'
import { AddListFormConfig as config } from 'uiSrc/pages/browser/components/add-key/constants/fields-config'
import { RiFlexItem, RiRow } from 'uiSrc/components/base/layout'
import {
  RiPrimaryButton,
  RiSecondaryButton,
  RiSelect,
} from 'uiSrc/components/base/forms'
import { RiTextInput } from 'uiSrc/components/base/inputs'
import { PushElementToListDto } from 'apiSrc/modules/browser/list/dto'

import styles from '../styles.module.scss'

export interface Props {
  closePanel: (isCancelled?: boolean) => void
}

export enum ListElementDestination {
  Tail = 'TAIL',
  Head = 'HEAD',
}

export const TAIL_DESTINATION: ListElementDestination =
  ListElementDestination.Tail
export const HEAD_DESTINATION: ListElementDestination =
  ListElementDestination.Head

export const optionsDestinations = [
  {
    value: TAIL_DESTINATION,
    inputDisplay: 'Push to tail',
    label: 'Push to tail',
  },
  {
    value: HEAD_DESTINATION,
    inputDisplay: 'Push to head',
    label: 'Push to head',
  },
]

const AddListElements = (props: Props) => {
  const { closePanel } = props

  const [elements, setElements] = useState<string[]>([''])
  const [destination, setDestination] =
    useState<ListElementDestination>(TAIL_DESTINATION)
  const { name: selectedKey = '' } = useSelector(selectedKeyDataSelector) ?? {
    name: undefined,
  }
  const { viewType } = useSelector(keysSelector)
  const { id: instanceId } = useSelector(connectedInstanceSelector)

  const elementInput = useRef<HTMLInputElement>(null)

  const dispatch = useDispatch()

  useEffect(() => {
    // ComponentDidMount
    elementInput.current?.focus()
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
        keyType: KeyTypes.List,
        numberOfAdded: elements.length,
      },
    })
  }

  const addField = () => {
    setElements([...elements, ''])
  }

  const onClickRemove = (_item: string, index?: number) => {
    if (elements.length === 1) {
      setElements([''])
    } else {
      setElements(elements.filter((_el, i) => i !== index))
    }
  }

  const isClearDisabled = (item: string) =>
    elements.length === 1 && !item.length

  const handleElementChange = (value: string, index: number) => {
    const newElements = [...elements]
    newElements[index] = value
    setElements(newElements)
  }

  const submitData = (): void => {
    const data: PushElementToListDto = {
      keyName: selectedKey,
      elements: elements.map((el) => stringToBuffer(el)),
      destination,
    }
    dispatch(insertListElementsAction(data, onSuccessAdded))
  }

  return (
    <>
      <div className={styles.container}>
        <RiSelect
          value={destination}
          options={optionsDestinations}
          onChange={(value) => setDestination(value as ListElementDestination)}
          data-testid="destination-select"
        />
        <AddMultipleFields
          items={elements}
          onClickRemove={onClickRemove}
          onClickAdd={addField}
          isClearDisabled={isClearDisabled}
        >
          {(item, index) => (
            <RiTextInput
              name={`element-${index}`}
              id={`element-${index}`}
              placeholder={config.element.placeholder}
              value={item}
              onChange={(value) => handleElementChange(value, index)}
              data-testid={`element-${index}`}
            />
          )}
        </AddMultipleFields>
      </div>
      <>
        <RiRow justify="end" gap="m" style={{ padding: 18 }}>
          <RiFlexItem>
            <div>
              <RiSecondaryButton
                onClick={() => closePanel(true)}
                data-testid="cancel-members-btn"
              >
                Cancel
              </RiSecondaryButton>
            </div>
          </RiFlexItem>
          <RiFlexItem>
            <div>
              <RiPrimaryButton
                onClick={submitData}
                data-testid="save-elements-btn"
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

export default AddListElements
