import React, { useEffect, useRef, useState } from 'react'
import { TFunction } from 'i18next'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'

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
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { TextInput } from 'uiSrc/components/base/inputs'
import { ListElementDestination, PushElementToListDto } from 'apiClient'
import {
  BrowserConfirmationCommandId,
  useProductionWriteConfirmation,
} from 'uiSrc/components/production-write-confirmation'
import { useTranslation } from 'uiSrc/i18n'

import { EntryContent } from '../../common/AddKeysContainer.styled'

export interface Props {
  closePanel: (isCancelled?: boolean) => void
}

export const TAIL_DESTINATION: ListElementDestination =
  ListElementDestination.Tail
export const HEAD_DESTINATION: ListElementDestination =
  ListElementDestination.Head

export const getPushDestinations = (t: TFunction) => [
  {
    value: TAIL_DESTINATION,
    inputDisplay: t('browser.list.push.tail'),
    label: t('browser.list.push.tail'),
  },
  {
    value: HEAD_DESTINATION,
    inputDisplay: t('browser.list.push.head'),
    label: t('browser.list.push.head'),
  },
]

const AddListElements = (props: Props) => {
  const { closePanel } = props
  const { t } = useTranslation()
  const optionsDestinations = getPushDestinations(t)

  const [elements, setElements] = useState<string[]>([''])
  const [destination, setDestination] =
    useState<ListElementDestination>(TAIL_DESTINATION)
  const { name: selectedKey = '' } = useAppSelector(
    selectedKeyDataSelector,
  ) ?? {
    name: undefined,
  }
  const { viewType } = useAppSelector(keysSelector)
  const { id: instanceId } = useAppSelector(connectedInstanceSelector)

  const elementInput = useRef<HTMLInputElement>(null)

  const dispatch = useAppDispatch()
  const { requestConfirmation } = useProductionWriteConfirmation()

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

  const handleSubmit = () => {
    requestConfirmation({
      title: t('browser.list.add.confirmTitle'),
      actionDescription: t('browser.list.add.confirmMessage', {
        count: elements.length,
      }),
      confirmButtonText: t('browser.list.add.confirmButton'),
      commandId: BrowserConfirmationCommandId.AddListElements,
      disableConfirmationInput: true,
      onConfirm: submitData,
    })
  }

  return (
    <Col gap="m">
      <EntryContent gap="m">
        <FlexItem>
          <RiSelect
            value={destination}
            options={optionsDestinations}
            onChange={(value) =>
              setDestination(value as ListElementDestination)
            }
            data-testid="destination-select"
          />
        </FlexItem>
        <AddMultipleFields
          items={elements}
          onClickRemove={onClickRemove}
          onClickAdd={addField}
          isClearDisabled={isClearDisabled}
        >
          {(item, index) => (
            <TextInput
              name={`element-${index}`}
              id={`element-${index}`}
              placeholder={config.element.placeholder}
              value={item}
              onChange={(value) => handleElementChange(value, index)}
              data-testid={`element-${index}`}
            />
          )}
        </AddMultipleFields>
      </EntryContent>
      <Row justify="end" gap="m">
        <FlexItem>
          <div>
            <SecondaryButton
              onClick={() => closePanel(true)}
              data-testid="cancel-members-btn"
            >
              {t('browser.list.add.cancel')}
            </SecondaryButton>
          </div>
        </FlexItem>
        <FlexItem>
          <div>
            <PrimaryButton
              onClick={handleSubmit}
              data-testid="save-elements-btn"
            >
              {t('browser.list.add.save')}
            </PrimaryButton>
          </div>
        </FlexItem>
      </Row>
    </Col>
  )
}

export default AddListElements
