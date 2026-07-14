import React, { useCallback } from 'react'

import { Text } from 'uiSrc/components/base/text'
import { ActionIconButton } from 'uiSrc/components/base/forms/buttons'
import { DeleteIcon } from 'uiSrc/components/base/icons'
import { Col } from 'uiSrc/components/base/layout/flex'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import TextInput from 'uiSrc/components/base/inputs/TextInput'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { CopyButton } from 'uiSrc/components/copy-button/CopyButton'

import {
  DECODER_TYPE_OPTIONS,
  VALUE_DECODER_TEST_ID,
} from './constants'
import { serializeDecoderForClipboard } from './decoderClipboard'
import {
  DECODER_TYPE_DESCRIPTIONS,
  KEY_PATTERN_FIELD_DESCRIPTION,
} from './descriptions'
import { createDescriptionSelectValueRender } from './DescriptionSelectValueRender'
import { FieldsSchemaEditor } from './FieldsSchemaEditor'
import { KeyPatternsEditor } from './KeyPatternsEditor'
import { isDecoderValid } from './schemaUtils'
import { DecoderType, SchemaNode, ValueDecoderRule } from './types'
import * as S from './ValueDecoderModal.styles'

const decoderTypeOptions = DECODER_TYPE_OPTIONS.map((option) => ({
  value: option.value,
  label: option.content,
}))

const decoderTypeValueRender = createDescriptionSelectValueRender(
  DECODER_TYPE_DESCRIPTIONS,
)

export interface DecoderEditorProps {
  decoder: ValueDecoderRule
  isExpanded: boolean
  onToggle: () => void
  onChange: (decoder: ValueDecoderRule) => void
  onRemove: () => void
  canRemove: boolean
  summary: string
  matchesCurrentKey?: boolean
}

export const DecoderEditor = ({
  decoder,
  isExpanded,
  onToggle,
  onChange,
  onRemove,
  canRemove,
  summary,
  matchesCurrentKey,
}: DecoderEditorProps) => {
  const handleFieldChange = useCallback(
    <K extends keyof ValueDecoderRule>(key: K, value: ValueDecoderRule[K]) => {
      onChange({ ...decoder, [key]: value })
    },
    [decoder, onChange],
  )

  const isValid = isDecoderValid(decoder)

  return (
    <S.DecoderSection $expanded={isExpanded} data-testid={`${VALUE_DECODER_TEST_ID}-decoder-${decoder.id}`}>
      <S.DecoderHeader>
        <S.DecoderSummaryButton
          type="button"
          onClick={onToggle}
          data-testid={`${VALUE_DECODER_TEST_ID}-decoder-toggle-${decoder.id}`}
        >
          <Text variant="semiBold" component="span">
            {summary}
          </Text>
          {matchesCurrentKey && (
            <S.DecoderMatchBadge>Matches current key</S.DecoderMatchBadge>
          )}
          {!isValid && (
            <S.DecoderMatchBadge $warning>Incomplete</S.DecoderMatchBadge>
          )}
        </S.DecoderSummaryButton>
        <S.RowActions>
          <CopyButton
            copy={serializeDecoderForClipboard(decoder)}
            aria-label="Copy decoder"
            tooltipConfig={{ content: 'Copy decoder' }}
            data-testid={`${VALUE_DECODER_TEST_ID}-copy-decoder-${decoder.id}`}
          />
          <ActionIconButton
            icon={DeleteIcon}
            aria-label="Remove decoder"
            onClick={onRemove}
            disabled={!canRemove}
            data-testid={`${VALUE_DECODER_TEST_ID}-remove-decoder-${decoder.id}`}
          />
        </S.RowActions>
      </S.DecoderHeader>

      {isExpanded && (
        <S.DecoderBody>
          <FormField label="Name" additionalText="Optional label for this decoder.">
            <TextInput
              value={decoder.name}
              onChange={(value) => handleFieldChange('name', value)}
              placeholder="Chunk state decoder"
              data-testid={`${VALUE_DECODER_TEST_ID}-decoder-name-${decoder.id}`}
            />
          </FormField>

          <FormField
            label="Key Patterns"
            required
            additionalText={KEY_PATTERN_FIELD_DESCRIPTION}
          >
            <KeyPatternsEditor
              listId={`decoder-${decoder.id}-patterns`}
              patterns={
                decoder.keyPatterns.length > 0 ? decoder.keyPatterns : ['']
              }
              onChange={(keyPatterns) => handleFieldChange('keyPatterns', keyPatterns)}
            />
          </FormField>

          <FormField label="Decoder Type" required>
            <RiSelect
              options={decoderTypeOptions}
              value={decoder.decoderType}
              onChange={(value) =>
                handleFieldChange('decoderType', value as DecoderType)
              }
              valueRender={decoderTypeValueRender}
              data-testid={`${VALUE_DECODER_TEST_ID}-decoder-type-${decoder.id}`}
            />
          </FormField>

          <Col gap="s">
            <Text variant="semiBold">Fields</Text>
            <FieldsSchemaEditor
              sortListId={`decoder-${decoder.id}-schema`}
              nodes={decoder.schema}
              onChange={(schema: SchemaNode[]) => handleFieldChange('schema', schema)}
            />
          </Col>
        </S.DecoderBody>
      )}
    </S.DecoderSection>
  )
}
