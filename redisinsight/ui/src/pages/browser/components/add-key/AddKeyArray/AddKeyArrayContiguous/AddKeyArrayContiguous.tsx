import React from 'react'

import { validateListIndex } from 'uiSrc/utils'
import { TextInput } from 'uiSrc/components/base/inputs'
import { Spacer } from 'uiSrc/components/base/layout'
import { FormField } from 'uiSrc/components/base/forms/FormField'

import { useTranslation } from 'uiSrc/i18n'
import { getAddArrayFormConfig } from '../../constants/fields-config'
import AddMultipleFields from '../../../add-multiple-fields'
import { AddKeyArrayContiguousProps } from './AddKeyArrayContiguous.types'

const AddKeyArrayContiguous = (props: AddKeyArrayContiguousProps) => {
  const { disabled, value, onChange } = props
  const { t } = useTranslation()
  const config = getAddArrayFormConfig(t)
  const { startIndex, values } = value

  const setStartIndex = (next: string) => onChange({ startIndex: next, values })
  const setValues = (next: string[]) => onChange({ startIndex, values: next })

  const addValueField = () => {
    setValues([...values, ''])
  }

  const onClickRemoveValue = (_item: string, index?: number) => {
    if (values.length === 1) {
      setValues([''])
    } else {
      setValues(values.filter((_el, i) => i !== index))
    }
  }

  const isClearValueDisabled = (item: string) =>
    values.length === 1 && !item.length

  const handleValueChange = (next: string, index: number) => {
    const newValues = [...values]
    newValues[index] = next
    setValues(newValues)
  }

  return (
    <>
      <FormField
        label={config.startIndex.label}
        required={config.startIndex.isRequire}
      >
        <TextInput
          id={config.startIndex.name}
          placeholder={config.startIndex.placeholder}
          value={startIndex}
          disabled={disabled}
          onChange={(next) => setStartIndex(validateListIndex(next))}
          data-testid="start-index"
        />
      </FormField>
      <Spacer size="m" />
      <AddMultipleFields
        items={values}
        onClickRemove={onClickRemoveValue}
        onClickAdd={addValueField}
        isClearDisabled={isClearValueDisabled}
      >
        {(item, index) => (
          <TextInput
            placeholder={config.value.placeholder}
            value={item}
            disabled={disabled}
            onChange={(next) => handleValueChange(next, index)}
            data-testid={`value-${index}`}
          />
        )}
      </AddMultipleFields>
    </>
  )
}

export default AddKeyArrayContiguous
