import React, { FormEvent, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toNumber } from 'lodash'

import { Maybe, stringToBuffer } from 'uiSrc/utils'
import { addKeyStateSelector, addArrayKey } from 'uiSrc/slices/browser/keys'
import { ActionFooter } from 'uiSrc/pages/browser/components/action-footer'
import AddMultipleFields from 'uiSrc/pages/browser/components/add-multiple-fields'
import { TextInput } from 'uiSrc/components/base/inputs'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { CreateArrayWithExpireDto } from 'uiSrc/slices/interfaces/array'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onCancel: (isCancelled?: boolean) => void
}

interface ArrayElementEntry {
  id: number
  index: string
  value: string
}

const INITIAL_ELEMENT = (): ArrayElementEntry => ({
  id: 0,
  index: '0',
  value: '',
})

const AddKeyArray = ({ keyName = '', keyTTL, onCancel }: Props) => {
  const dispatch = useDispatch()
  const { loading } = useSelector(addKeyStateSelector)

  const [elements, setElements] = useState<ArrayElementEntry[]>([
    INITIAL_ELEMENT(),
  ])
  const [isFormValid, setIsFormValid] = useState(false)
  const lastAddedIndex = useRef<HTMLInputElement>(null)
  const prevCount = useRef<number>(0)

  useEffect(() => {
    const allIndicesValid = elements.every(
      (el) =>
        el.index !== '' &&
        !Number.isNaN(Number(el.index)) &&
        Number.isInteger(Number(el.index)) &&
        Number(el.index) >= 0,
    )
    setIsFormValid(keyName.length > 0 && allIndicesValid)
  }, [keyName, elements])

  useEffect(() => {
    if (prevCount.current !== 0 && prevCount.current < elements.length) {
      lastAddedIndex.current?.focus()
    }
    prevCount.current = elements.length
  }, [elements.length])

  const addField = () => {
    const lastId = elements[elements.length - 1].id
    const validIndices = elements
      .map((el) => toNumber(el.index))
      .filter((n) => !Number.isNaN(n))
    const nextIndex = String(
      (validIndices.length > 0 ? Math.max(...validIndices) : -1) + 1,
    )
    setElements([...elements, { id: lastId + 1, index: nextIndex, value: '' }])
  }

  const clearElement = (id: number) => {
    setElements(
      elements.map((el) =>
        el.id === id ? { ...el, index: '0', value: '' } : el,
      ),
    )
  }

  const onClickRemove = ({ id }: ArrayElementEntry) => {
    if (elements.length === 1) {
      clearElement(id)
      return
    }
    setElements(elements.filter((el) => el.id !== id))
  }

  const isClearDisabled = (item: ArrayElementEntry): boolean =>
    elements.length === 1 && !item.value.length && item.index === '0'

  const handleChange = (
    field: 'index' | 'value',
    id: number,
    value: string,
  ) => {
    setElements(
      elements.map((el) => (el.id === id ? { ...el, [field]: value } : el)),
    )
  }

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
