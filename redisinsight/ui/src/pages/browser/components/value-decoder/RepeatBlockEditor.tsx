import React, { ReactNode } from 'react'

import { ActionIconButton } from 'uiSrc/components/base/forms/buttons'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { DeleteIcon } from 'uiSrc/components/base/icons'

import { VALUE_DECODER_TEST_ID } from './constants'
import { getPriorNumericFieldsInScope, NumericFieldRef } from './schemaUtils'
import { RepeatBlockDefinition, SchemaNode } from './types'
import * as S from './ValueDecoderModal.styles'

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

export interface RepeatBlockEditorProps {
  repeat: RepeatBlockDefinition
  index: number
  nodes: SchemaNode[]
  priorNumericFields: NumericFieldRef[]
  depth: number
  onRepeatChange: (
    id: string,
    patch: Partial<{ countFieldRef: string }>,
  ) => void
  onRemove: (id: string) => void
  children: ReactNode
}

export const RepeatBlockEditor = ({
  repeat,
  index,
  nodes,
  priorNumericFields,
  depth,
  onRepeatChange,
  onRemove,
  children,
}: RepeatBlockEditorProps) => {
  const repeatScopeNumeric = getPriorNumericFieldsInScope(
    priorNumericFields,
    nodes,
    index,
  )

  return (
    <S.RepeatBlock
      $depth={depth}
      data-testid={`${VALUE_DECODER_TEST_ID}-repeat-${repeat.id}`}
    >
      <S.RepeatHeader>
        <S.RepeatLabel>Repeat</S.RepeatLabel>
        <RiSelect
          options={toNumericOptions(repeatScopeNumeric)}
          value={repeat.countFieldRef || undefined}
          onChange={(value) =>
            onRepeatChange(repeat.id, { countFieldRef: value ?? '' })
          }
          placeholder="Select count field"
          data-testid={`${VALUE_DECODER_TEST_ID}-repeat-count-${repeat.id}`}
        />
        <ActionIconButton
          icon={DeleteIcon}
          aria-label="Remove repeat block"
          onClick={() => onRemove(repeat.id)}
          data-testid={`${VALUE_DECODER_TEST_ID}-remove-repeat-${repeat.id}`}
        />
      </S.RepeatHeader>

      {children}
    </S.RepeatBlock>
  )
}
