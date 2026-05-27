import React, { FormEvent, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { toNumber } from 'lodash'

import { addArrayElementsStateSelector } from 'uiSrc/slices/browser/array'
import AddMultipleFields from 'uiSrc/pages/browser/components/add-multiple-fields'
import { TextInput } from 'uiSrc/components/base/inputs'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Text } from 'uiSrc/components/base/text'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'

export interface ArrayElementEntry {
  index: number
  value: string
}

interface ElementRow {
  id: number
  index: string
  value: string
}

export interface Props {
  onSubmit: (
    elements: ArrayElementEntry[],
    onSuccess?: () => void,
    onFail?: () => void,
  ) => void
  onCancel: () => void
}

const ArrayAddElementForm = ({ onSubmit, onCancel }: Props) => {
  const { loading } = useSelector(addArrayElementsStateSelector)

  const [elements, setElements] = useState<ElementRow[]>([
    { id: 0, index: '', value: '' },
  ])
  const lastAddedIndex = useRef<HTMLInputElement>(null)
  const prevCount = useRef<number>(0)

  useEffect(() => {
    if (prevCount.current !== 0 && prevCount.current < elements.length) {
      lastAddedIndex.current?.focus()
    }
    prevCount.current = elements.length
  }, [elements.length])

  const isFormValid = elements.every(
    (el) =>
      el.index !== '' &&
      !Number.isNaN(Number(el.index)) &&
      Number(el.index) >= 0,
  )

  const addField = () => {
    const lastId = elements[elements.length - 1].id
    const nextIndex = String(
      Math.max(...elements.map((el) => toNumber(el.index || '0'))) + 1,
    )
    setElements([...elements, { id: lastId + 1, index: nextIndex, value: '' }])
  }

  const clearElement = (id: number) => {
    setElements(
      elements.map((el) =>
        el.id === id ? { ...el, index: '', value: '' } : el,
      ),
    )
  }

  const onClickRemove = ({ id }: ElementRow) => {
    if (elements.length === 1) {
      clearElement(id)
      return
    }
    setElements(elements.filter((el) => el.id !== id))
  }

  const isClearDisabled = (item: ElementRow): boolean =>
    elements.length === 1 && !item.value.length && item.index === ''

  const handleChange = (field: 'index' | 'value', id: number, val: string) => {
    setElements(
      elements.map((el) => (el.id === id ? { ...el, [field]: val } : el)),
    )
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return
    onSubmit(
      elements.map((el) => ({ index: Number(el.index), value: el.value })),
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Text size="s" color="subdued">
        Set values at specific indices in the array. Existing values at those
        indices will be overwritten.
      </Text>
      <Spacer size="m" />
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
                name={`array-element-index-${item.id}`}
                id={`array-element-index-${item.id}`}
                placeholder="e.g. 0"
                value={item.index}
                disabled={loading}
                onChange={(val: string) => handleChange('index', item.id, val)}
                ref={index === elements.length - 1 ? lastAddedIndex : null}
                data-testid={`array-element-index-${item.id}`}
              />
            </FlexItem>
            <FlexItem grow>
              <TextInput
                name={`array-element-value-${item.id}`}
                id={`array-element-value-${item.id}`}
                placeholder="Element value"
                value={item.value}
                disabled={loading}
                onChange={(val: string) => handleChange('value', item.id, val)}
                data-testid={`array-element-value-${item.id}`}
              />
            </FlexItem>
          </Row>
        )}
      </AddMultipleFields>
      <Spacer size="m" />
      <Row justify="end" gap="m">
        <FlexItem>
          <SecondaryButton
            onClick={() => onCancel()}
            data-testid="cancel-array-elements-btn"
          >
            Cancel
          </SecondaryButton>
        </FlexItem>
        <FlexItem>
          <PrimaryButton
            type="submit"
            loading={loading}
            disabled={!isFormValid || loading}
            data-testid="array-add-element-btn"
          >
            Save
          </PrimaryButton>
        </FlexItem>
      </Row>
    </form>
  )
}

export { ArrayAddElementForm as AddKeyArray }
