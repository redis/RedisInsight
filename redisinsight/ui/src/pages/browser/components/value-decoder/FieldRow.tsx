import React from 'react'

import { ActionIconButton } from 'uiSrc/components/base/forms/buttons'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { DeleteIcon } from 'uiSrc/components/base/icons'
import TextInput from 'uiSrc/components/base/inputs/TextInput'

import { BINARY_DATA_TYPES, VALUE_DECODER_TEST_ID } from './constants'
import { createDescriptionSelectValueRender } from './DescriptionSelectValueRender'
import { DATA_TYPE_DESCRIPTIONS } from './descriptions'
import { FieldSizeEditor } from './FieldSizeEditor'
import {
  getPriorNumericFieldsInScope,
  NumericFieldRef,
  toNumericOptions,
} from './schemaUtils'
import { BinaryFieldDefinition, SchemaNode } from './types'
import * as S from './ValueDecoderModal.styles'

const dataTypeOptions = BINARY_DATA_TYPES.map((type) => ({
  value: type,
  label: type,
}))

const dataTypeValueRender = createDescriptionSelectValueRender(
  DATA_TYPE_DESCRIPTIONS,
)

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
