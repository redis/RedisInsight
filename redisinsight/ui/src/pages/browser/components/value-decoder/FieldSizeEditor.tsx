import React from 'react'

import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import NumericInput from 'uiSrc/components/base/inputs/NumericInput'

import { SIZE_SOURCE_OPTIONS, VALUE_DECODER_TEST_ID } from './constants'
import { NumericFieldOption } from './schemaUtils'
import { BinaryFieldDefinition, FieldSizeSource } from './types'
import { getFixedSize, getSizeUnit } from './utils'
import * as S from './ValueDecoderModal.styles'

const sizeSourceOptions = SIZE_SOURCE_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}))

export interface FieldSizeEditorProps {
  field: BinaryFieldDefinition
  sizeSource: FieldSizeSource
  sizeRefs: NumericFieldOption[]
  onFieldChange: (id: string, patch: Partial<BinaryFieldDefinition>) => void
}

export const FieldSizeEditor = ({
  field,
  sizeSource,
  sizeRefs,
  onFieldChange,
}: FieldSizeEditorProps) => {
  const fixedSize = getFixedSize(field.dataType)
  const isCustomSize = fixedSize === 'custom'

  if (!isCustomSize) {
    return (
      <S.SizeInputWrapper>
        <NumericInput
          value={field.size === '' ? null : Number(field.size)}
          onChange={() => {}}
          disabled
          data-testid={`${VALUE_DECODER_TEST_ID}-field-size-${field.id}`}
        />
        <S.SizeUnit
          data-testid={`${VALUE_DECODER_TEST_ID}-field-size-unit-${field.id}`}
        >
          {getSizeUnit(field.size)}
        </S.SizeUnit>
      </S.SizeInputWrapper>
    )
  }

  return (
    <S.SizeSourceWrapper>
      <RiSelect
        options={sizeSourceOptions}
        value={sizeSource}
        onChange={(value) =>
          onFieldChange(field.id, {
            sizeSource: value as FieldSizeSource,
            sizeFieldRef: value === 'field' ? field.sizeFieldRef : undefined,
          })
        }
        data-testid={`${VALUE_DECODER_TEST_ID}-field-size-source-${field.id}`}
      />
      {sizeSource === 'field' ? (
        <RiSelect
          options={sizeRefs}
          value={field.sizeFieldRef || undefined}
          onChange={(value) =>
            onFieldChange(field.id, { sizeFieldRef: value ?? '' })
          }
          placeholder="Select size field"
          data-testid={`${VALUE_DECODER_TEST_ID}-field-size-ref-${field.id}`}
        />
      ) : (
        <S.SizeInputWrapper>
          <NumericInput
            value={field.size === '' ? null : Number(field.size)}
            onChange={(value) =>
              onFieldChange(field.id, {
                size: value == null || Number.isNaN(value) ? '' : value,
              })
            }
            min={1}
            data-testid={`${VALUE_DECODER_TEST_ID}-field-size-${field.id}`}
          />
          <S.SizeUnit
            data-testid={`${VALUE_DECODER_TEST_ID}-field-size-unit-${field.id}`}
          >
            {getSizeUnit(field.size)}
          </S.SizeUnit>
        </S.SizeInputWrapper>
      )}
    </S.SizeSourceWrapper>
  )
}
