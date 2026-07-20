import React from 'react'

import { validateListIndex } from 'uiSrc/utils'
import { TextInput } from 'uiSrc/components/base/inputs'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { FormField } from 'uiSrc/components/base/forms/FormField'

import { AddArrayFormConfig as config } from '../../constants/fields-config'
import AddMultipleFields from '../../../add-multiple-fields'
import {
  IArraySparseElement,
  INITIAL_SPARSE_ELEMENT,
} from '../AddKeyArray.types'
import { AddKeyArraySparseProps } from './AddKeyArraySparse.types'

const AddKeyArraySparse = (props: AddKeyArraySparseProps) => {
  const { disabled, value, onChange } = props
  const { elements } = value

  const setElements = (next: IArraySparseElement[]) =>
    onChange({ elements: next })

  const addElementField = () => {
    const lastElement = elements[elements.length - 1]
    setElements([
      ...elements,
      {
        ...INITIAL_SPARSE_ELEMENT,
        id: lastElement.id + 1,
      },
    ])
  }

  const clearElementValues = (id: number) => {
    setElements(
      elements.map((item) =>
        item.id === id ? { ...item, index: '', value: '' } : item,
      ),
    )
  }

  const onClickRemoveElement = ({ id }: IArraySparseElement) => {
    if (elements.length === 1) {
      clearElementValues(id)
      return
    }

    setElements(elements.filter((item) => item.id !== id))
  }

  const isClearElementDisabled = (item: IArraySparseElement): boolean =>
    elements.length === 1 && !(item.index.length || item.value.length)

  const handleElementChange = (
    formField: 'index' | 'value',
    id: number,
    next: string,
  ) => {
    setElements(
      elements.map((item) =>
        item.id === id ? { ...item, [formField]: next } : item,
      ),
    )
  }

  return (
    <AddMultipleFields
      items={elements}
      isClearDisabled={isClearElementDisabled}
      onClickRemove={onClickRemoveElement}
      onClickAdd={addElementField}
    >
      {(item) => (
        <Row align="center" gap="m">
          <FlexItem grow={1}>
            <FormField>
              <TextInput
                placeholder={config.index.placeholder}
                value={item.index}
                disabled={disabled}
                onChange={(next) =>
                  handleElementChange('index', item.id, validateListIndex(next))
                }
                data-testid={`sparse-index-${item.id}`}
              />
            </FormField>
          </FlexItem>
          <FlexItem grow={2}>
            <FormField>
              <TextInput
                placeholder={config.value.placeholder}
                value={item.value}
                disabled={disabled}
                onChange={(next) => handleElementChange('value', item.id, next)}
                data-testid={`sparse-value-${item.id}`}
              />
            </FormField>
          </FlexItem>
        </Row>
      )}
    </AddMultipleFields>
  )
}

export default AddKeyArraySparse
