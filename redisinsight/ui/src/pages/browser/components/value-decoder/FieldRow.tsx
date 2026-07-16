import React from 'react'

import { ActionIconButton } from 'uiSrc/components/base/forms/buttons'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { DeleteIcon } from 'uiSrc/components/base/icons'
import NumericInput from 'uiSrc/components/base/inputs/NumericInput'
import TextInput from 'uiSrc/components/base/inputs/TextInput'

import {
  BINARY_DATA_TYPES,
  SIZE_SOURCE_OPTIONS,
  VALUE_DECODER_TEST_ID,
} from './constants'
import { createDescriptionSelectValueRender } from './DescriptionSelectValueRender'
import { DATA_TYPE_DESCRIPTIONS } from './descriptions'
import { getPriorNumericFieldsInScope, NumericFieldRef } from './schemaUtils'
import { BinaryFieldDefinition, FieldSizeSource, SchemaNode } from './types'
import { getFixedSize, getSizeUnit } from './utils'
import * as S from './ValueDecoderModal.styles'

const dataTypeOptions = BINARY_DATA_TYPES.map((type) => ({
  value: type,
  label: type,
}))

const sizeSourceOptions = SIZE_SOURCE_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}))

const dataTypeValueRender = createDescriptionSelectValueRender(
  DATA_TYPE_DESCRIPTIONS,
)

const toNumericOptions = (fields: NumericFieldRef[]) => {
  const nameCounts = fields.reduce<Record<string, number>>((counts, item) => {
    counts[item.name] = (counts[item.name] ?? 0) + 1
    return counts
  }, {})

  return fields.map((item) => ({
    value: item.id,
    label:
      nameCounts[item.name] > 1
        ? `${item.name} (${item.dataType}) · ${item.id}`
        : `${item.name} (${item.dataType})`,
  }))
}

interface FieldSizeEditorProps {
  field: BinaryFieldDefinition
  sizeSource: FieldSizeSource
  sizeRefs: ReturnType<typeof toNumericOptions>
  onFieldChange: (id: string, patch: Partial<BinaryFieldDefinition>) => void
}

const FieldSizeEditor = ({
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

export interface FieldRowProps {
  field: BinaryFieldDefinition
  index: number
  nodes: SchemaNode[]
  priorNumericFields: NumericFieldRef[]
  onFieldChange: (id: string, patch: Partial<BinaryFieldDefinition>) => void
  onRemove: (id: string) => void
}

export const FieldRow = ({
  field,
  index,
  nodes,
  priorNumericFields,
  onFieldChange,
  onRemove,
}: FieldRowProps) => {
  const sizeSource = field.sizeSource ?? 'fixed'
  const sizeRefs = toNumericOptions(
    getPriorNumericFieldsInScope(priorNumericFields, nodes, index),
  )

  return (
    <S.FieldRowGrid>
      <TextInput
        value={field.name}
        onChange={(value) => onFieldChange(field.id, { name: value })}
        placeholder="fieldName"
        data-testid={`${VALUE_DECODER_TEST_ID}-field-name-${field.id}`}
      />
      <RiSelect
        options={dataTypeOptions}
        value={field.dataType}
        onChange={(value) => onFieldChange(field.id, { dataType: value })}
        valueRender={dataTypeValueRender}
        data-testid={`${VALUE_DECODER_TEST_ID}-field-type-${field.id}`}
      />
      <div>
        <FieldSizeEditor
          field={field}
          sizeSource={sizeSource}
          sizeRefs={sizeRefs}
          onFieldChange={onFieldChange}
        />
      </div>
      <ActionIconButton
        icon={DeleteIcon}
        aria-label="Remove field"
        onClick={() => onRemove(field.id)}
        data-testid={`${VALUE_DECODER_TEST_ID}-remove-field-${field.id}`}
      />
    </S.FieldRowGrid>
  )
}
