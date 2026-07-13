import React, { useCallback } from 'react'
import { useTranslation } from 'uiSrc/i18n'
import {
  FieldTypes,
  FIELD_TYPE_OPTIONS,
} from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import {
  RiSelect,
  SelectValueRenderParams,
} from 'uiSrc/components/base/forms/select/RiSelect'
import { Text } from 'uiSrc/components/base/text'
import { FieldTag } from 'uiSrc/pages/vector-search/components/field-tag/FieldTag'

import * as S from './FieldTypeSelect.styles'

export interface FieldTypeSelectProps {
  value: FieldTypes
  onChange: (value: FieldTypes) => void
  dataTestId?: string
}

const fieldTypeDescriptionKeys: Record<FieldTypes, string> = Object.fromEntries(
  FIELD_TYPE_OPTIONS.map((option) => [option.value, option.descriptionKey]),
) as Record<FieldTypes, string>

const fieldTypeSelectOptions = FIELD_TYPE_OPTIONS.map((option) => ({
  value: option.value,
  label: option.text,
}))

export const FieldTypeSelect = ({
  value,
  onChange,
  dataTestId = 'field-type-select',
}: FieldTypeSelectProps) => {
  const { t } = useTranslation()

  const valueRender = useCallback(
    ({ option, isOptionValue }: SelectValueRenderParams) => {
      const fieldType = option.value as FieldTypes

      if (isOptionValue) {
        return (
          <S.DropdownOption align="center" gap="m">
            <FieldTag tag={fieldType} />
            <Text color="ghost">
              {t(fieldTypeDescriptionKeys[fieldType] as never)}
            </Text>
          </S.DropdownOption>
        )
      }

      return <FieldTag tag={fieldType} />
    },
    [t],
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
