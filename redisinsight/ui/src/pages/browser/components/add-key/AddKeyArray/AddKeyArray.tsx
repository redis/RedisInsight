import React, { FormEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toNumber } from 'lodash'

import { Maybe, stringToBuffer } from 'uiSrc/utils'
import { addKeyStateSelector, addArrayKey } from 'uiSrc/slices/browser/keys'
import { ActionFooter } from 'uiSrc/pages/browser/components/action-footer'
import AddMultipleFields from 'uiSrc/pages/browser/components/add-multiple-fields'
import { TextInput } from 'uiSrc/components/base/inputs'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { CreateArrayWithExpireDto } from 'uiSrc/slices/interfaces/array'
import { useArrayElementRows } from 'uiSrc/pages/browser/hooks/useArrayElementRows'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onCancel: (isCancelled?: boolean) => void
}

const AddKeyArray = ({ keyName = '', keyTTL, onCancel }: Props) => {
  const dispatch = useDispatch()
  const { loading } = useSelector(addKeyStateSelector)

  const {
    elements,
    lastAddedIndex,
    addField,
    onClickRemove,
    isClearDisabled,
    handleChange,
    allIndicesValid,
  } = useArrayElementRows({ emptyIndexValue: '0' })

  const isFormValid = keyName.length > 0 && allIndicesValid

  const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isFormValid) submitData()
  }

  const submitData = () => {
    const data: CreateArrayWithExpireDto = {
      keyName: stringToBuffer(keyName),
      elements: elements.map((el) => ({
        index: toNumber(el.index),
        value: stringToBuffer(el.value),
      })),
      ...(keyTTL !== undefined ? { expire: toNumber(keyTTL) } : {}),
    }
    dispatch(addArrayKey(data, onCancel))
  }

  return (
    <form onSubmit={onFormSubmit}>
      <AddMultipleFields
        items={elements}
        isClearDisabled={isClearDisabled}
        onClickRemove={onClickRemove}
        onClickAdd={addField}
      >
        {(item, index) => (
          <Row align="center" gap="m">
            <FlexItem style={{ width: 120, flexShrink: 0 }}>
              <TextInput
                name={`array-index-${item.id}`}
                id={`array-index-${item.id}`}
                placeholder="Index"
                value={item.index}
                disabled={loading}
                onChange={(val: string) => handleChange('index', item.id, val)}
                ref={index === elements.length - 1 ? lastAddedIndex : null}
                data-testid={`array-index-${item.id}`}
              />
            </FlexItem>
            <FlexItem grow>
              <TextInput
                name={`array-value-${item.id}`}
                id={`array-value-${item.id}`}
                placeholder="Value"
                value={item.value}
                disabled={loading}
                onChange={(val: string) => handleChange('value', item.id, val)}
                data-testid={`array-value-${item.id}`}
              />
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
