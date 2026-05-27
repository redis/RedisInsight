import React, { FormEvent } from 'react'
import { useSelector } from 'react-redux'

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
import { useArrayElementRows } from 'uiSrc/pages/browser/hooks/useArrayElementRows'

export interface ArrayElementEntry {
  index: number
  value: string
}

export interface Props {
  onSubmit: (elements: ArrayElementEntry[]) => void
  onCancel: () => void
}

const ArrayAddElementForm = ({ onSubmit, onCancel }: Props) => {
  const { loading } = useSelector(addArrayElementsStateSelector)

  const {
    elements,
    lastAddedIndex,
    addField,
    onClickRemove,
    isClearDisabled,
    handleChange,
    allIndicesValid,
  } = useArrayElementRows()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!allIndicesValid) return
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
            disabled={!allIndicesValid || loading}
            data-testid="array-add-element-btn"
          >
            Save
          </PrimaryButton>
        </FlexItem>
      </Row>
    </form>
  )
}

export { ArrayAddElementForm }
