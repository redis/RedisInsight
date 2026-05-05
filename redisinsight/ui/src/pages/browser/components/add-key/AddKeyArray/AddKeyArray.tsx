import React, { FormEvent, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Maybe, stringToBuffer, validateArrayIndex } from 'uiSrc/utils'
import { addArrayKey, addKeyStateSelector } from 'uiSrc/slices/browser/keys'
import AddMultipleFields from 'uiSrc/pages/browser/components/add-multiple-fields'
import { ActionFooter } from 'uiSrc/pages/browser/components/action-footer'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { TextInput } from 'uiSrc/components/base/inputs'
import { CreateArrayWithExpireDto } from 'apiSrc/modules/browser/array/dto'
import { AddArrayFormConfig as config } from '../constants/fields-config'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onCancel: (isCancelled?: boolean) => void
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

const AddKeyArray = (props: Props) => {
  const { keyName = '', keyTTL, onCancel } = props
  const { loading } = useSelector(addKeyStateSelector)

  const [elements, setElements] = useState<ArrayFieldState[]>([INITIAL_FIELD])
  const [isFormValid, setIsFormValid] = useState<boolean>(false)

  const dispatch = useDispatch()

  useEffect(() => {
    setIsFormValid(
      keyName.length > 0 && elements.every((element) => element.index !== ''),
    )
  }, [keyName, elements])

  const onFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (isFormValid) {
      submitData()
    }
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
    const data: CreateArrayWithExpireDto = {
      keyName: stringToBuffer(keyName),
      elements: elements.map((element) => ({
        index: element.index,
        value: stringToBuffer(element.value),
      })),
    }
    if (keyTTL !== undefined) {
      data.expire = keyTTL
    }
    dispatch(addArrayKey(data, onCancel))
  }

  return (
    <form onSubmit={onFormSubmit}>
      <AddMultipleFields
        items={elements}
        onClickRemove={onClickRemove}
        onClickAdd={addField}
        isClearDisabled={isClearDisabled}
      >
        {(item) => (
          <Row align="center" gap="m">
            <FlexItem grow={1}>
              <FormField>
                <TextInput
                  name={`array-index-${item.id}`}
                  id={`array-index-${item.id}`}
                  placeholder={config.index.placeholder}
                  value={item.index}
                  disabled={loading}
                  onChange={(value) =>
                    handleElementChange(item.id, 'index', value)
                  }
                  data-testid="array-index"
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
                  disabled={loading}
                  onChange={(value) =>
                    handleElementChange(item.id, 'value', value)
                  }
                  data-testid="array-value"
                />
              </FormField>
            </FlexItem>
          </Row>
        )}
      </AddMultipleFields>
      <ActionFooter
        onCancel={() => onCancel(true)}
        onAction={submitData}
        actionText="Add Key"
        loading={loading}
        disabled={!isFormValid}
        actionTestId="add-key-array-btn"
      />
    </form>
  )
}

export default AddKeyArray
