import React, { useCallback } from 'react'
import {
  FieldTypes,
  FIELD_TYPE_OPTIONS,
} from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import {
  RiSelect,
  SelectValueRenderParams,
} from 'uiSrc/components/base/forms/select/RiSelect'
import { FieldTag } from 'uiSrc/components/new-index/create-index-step/field-box/FieldTag'

export interface FieldTypeSelectProps {
  value: FieldTypes
  onChange: (value: FieldTypes) => void
  dataTestId?: string
}

const fieldTypeSelectOptions = FIELD_TYPE_OPTIONS.map((option) => ({
  value: option.value,
  label: option.text,
}))

export const FieldTypeSelect = ({
  value,
  onChange,
  dataTestId = 'field-type-select',
}: FieldTypeSelectProps) => {
  const valueRender = useCallback(
    ({ option }: SelectValueRenderParams) => (
      <FieldTag tag={option.value as FieldTypes} />
    ),
    [],
  )

  const handleChange = useCallback(
    (selectedValue: string) => {
      onChange(selectedValue as FieldTypes)
    },
    [onChange],
  )

  return (
    <RiSelect
      options={fieldTypeSelectOptions}
      value={value}
      onChange={handleChange}
      valueRender={valueRender}
      data-testid={dataTestId}
    />
  )
}
