import React, { FormEvent, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Maybe, stringToBuffer } from 'uiSrc/utils'
import { addKeyStateSelector, addListKey } from 'uiSrc/slices/browser/keys'
import { ActionFooter } from 'uiSrc/pages/browser/components/action-footer'
import {
  optionsDestinations,
  TAIL_DESTINATION,
} from 'uiSrc/pages/browser/modules/key-details/components/list-details/add-list-elements/AddListElements'
import { RiSelect } from 'uiSrc/components/base/forms'
import { RiTextInput } from 'uiSrc/components/base/inputs'
import {
  CreateListWithExpireDto,
  ListElementDestination,
} from 'apiSrc/modules/browser/list/dto'

import { AddListFormConfig as config } from '../constants/fields-config'
import AddMultipleFields from '../../add-multiple-fields'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onCancel: (isCancelled?: boolean) => void
}

const AddKeyList = (props: Props) => {
  const { keyName = '', keyTTL, onCancel } = props
  const [elements, setElements] = useState<string[]>([''])
  const [destination, setDestination] =
    useState<ListElementDestination>(TAIL_DESTINATION)

  const [isFormValid, setIsFormValid] = useState<boolean>(false)

  const { loading } = useSelector(addKeyStateSelector)

  const dispatch = useDispatch()

  useEffect(() => {
    setIsFormValid(keyName.length > 0)
  }, [keyName])

  const onFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (isFormValid) {
      submitData()
    }
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
    const data: CreateListWithExpireDto = {
      destination,
      keyName: stringToBuffer(keyName),
      elements: elements.map((el) => stringToBuffer(el)),
    }
    if (keyTTL !== undefined) {
      data.expire = keyTTL
    }
    dispatch(addListKey(data, onCancel))
  }

  return (
    <form onSubmit={onFormSubmit}>
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
            disabled={loading}
            onChange={(value) => handleElementChange(value, index)}
            data-testid={`element-${index}`}
          />
        )}
      </AddMultipleFields>
      <ActionFooter
        onCancel={() => onCancel(true)}
        onAction={submitData}
        actionText="Add Key"
        loading={loading}
        disabled={!isFormValid}
        actionTestId="add-key-list-btn"
      />
    </form>
  )
}

export default AddKeyList
