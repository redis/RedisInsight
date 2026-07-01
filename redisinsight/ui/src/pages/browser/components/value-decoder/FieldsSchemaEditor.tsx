import React, { useCallback } from 'react'

import { ActionIconButton, SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { DeleteIcon } from 'uiSrc/components/base/icons'
import { Row } from 'uiSrc/components/base/layout/flex'
import TextInput from 'uiSrc/components/base/inputs/TextInput'
import NumericInput from 'uiSrc/components/base/inputs/NumericInput'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'

import {
  BINARY_DATA_TYPES,
  createEmptyField,
  createEmptyRepeatBlock,
  isRepeatNode,
  SIZE_SOURCE_OPTIONS,
  VALUE_DECODER_TEST_ID,
} from './constants'
import { DATA_TYPE_DESCRIPTIONS } from './descriptions'
import { createDescriptionSelectValueRender } from './DescriptionSelectValueRender'
import {
  getPriorNumericFieldsInScope,
  isCustomSizeType,
  NumericFieldRef,
  removeSchemaNode,
  updateSchemaNode,
} from './schemaUtils'
import { reorderList } from './reorderList'
import { SortableItem } from './SortableItem'
import {
  BinaryFieldDefinition,
  FieldSizeSource,
  RepeatBlockDefinition,
  SchemaNode,
} from './types'
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

export interface FieldsSchemaEditorProps {
  sortListId: string
  nodes: SchemaNode[]
  onChange: (nodes: SchemaNode[]) => void
  priorNumericFields?: NumericFieldRef[]
  depth?: number
}

interface FieldRowProps {
  field: BinaryFieldDefinition
  index: number
  nodes: SchemaNode[]
  priorNumericFields: NumericFieldRef[]
  onFieldChange: (id: string, patch: Partial<BinaryFieldDefinition>) => void
  onRemove: (id: string) => void
}

const FieldRow = ({
  field,
  index,
  nodes,
  priorNumericFields,
  onFieldChange,
  onRemove,
}: FieldRowProps) => {
  const fixedSize = getFixedSize(field.dataType)
  const isCustomSize = fixedSize === 'custom'
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
        {isCustomSize ? (
          <S.SizeSourceWrapper>
            <RiSelect
              options={sizeSourceOptions}
              value={sizeSource}
              onChange={(value) =>
                onFieldChange(field.id, {
                  sizeSource: value as FieldSizeSource,
                  sizeFieldRef:
                    value === 'field' ? field.sizeFieldRef : undefined,
                })
              }
              data-testid={`${VALUE_DECODER_TEST_ID}-field-size-source-${field.id}`}
            />
            {sizeSource === 'field' ? (
              <RiSelect
                options={sizeRefs}
                value={field.sizeFieldRef || null}
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
                      size:
                        value == null || Number.isNaN(value) ? '' : value,
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
        ) : (
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
        )}
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

interface RepeatBlockEditorProps {
  repeat: RepeatBlockDefinition
  index: number
  nodes: SchemaNode[]
  priorNumericFields: NumericFieldRef[]
  depth: number
  onRepeatChange: (
    id: string,
    patch: Partial<{ countFieldRef: string }>,
  ) => void
  onRepeatFieldsChange: (repeatId: string, fields: SchemaNode[]) => void
  onRemove: (id: string) => void
}

const RepeatBlockEditor = ({
  repeat,
  index,
  nodes,
  priorNumericFields,
  depth,
  onRepeatChange,
  onRepeatFieldsChange,
  onRemove,
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
          value={repeat.countFieldRef || null}
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

      <FieldsSchemaEditor
        sortListId={`repeat-${repeat.id}`}
        nodes={repeat.fields}
        onChange={(fields) => onRepeatFieldsChange(repeat.id, fields)}
        priorNumericFields={repeatScopeNumeric}
        depth={depth + 1}
      />
    </S.RepeatBlock>
  )
}

export const FieldsSchemaEditor = ({
  sortListId,
  nodes,
  onChange,
  priorNumericFields = [],
  depth = 0,
}: FieldsSchemaEditorProps) => {
  const handleFieldChange = useCallback(
    (id: string, patch: Partial<BinaryFieldDefinition>) => {
      onChange(
        updateSchemaNode(nodes, id, (node) => {
          if (node.kind !== 'field') {
            return node
          }

          const nextField = { ...node, ...patch }
          if (patch.dataType) {
            const fixedSize = getFixedSize(patch.dataType)
            nextField.size = fixedSize === 'custom' ? '' : fixedSize
            if (!isCustomSizeType(patch.dataType)) {
              nextField.sizeSource = 'fixed'
              nextField.sizeFieldRef = undefined
            }
          }
          return nextField
        }),
      )
    },
    [nodes, onChange],
  )

  const handleRepeatChange = useCallback(
    (id: string, patch: Partial<{ countFieldRef: string }>) => {
      onChange(
        updateSchemaNode(nodes, id, (node) => {
          if (node.kind !== 'repeat') {
            return node
          }
          return { ...node, ...patch }
        }),
      )
    },
    [nodes, onChange],
  )

  const handleRepeatFieldsChange = useCallback(
    (repeatId: string, fields: SchemaNode[]) => {
      onChange(
        updateSchemaNode(nodes, repeatId, (node) => {
          if (node.kind !== 'repeat') {
            return node
          }
          return { ...node, fields }
        }),
      )
    },
    [nodes, onChange],
  )

  const handleRemoveNode = useCallback(
    (id: string) => {
      onChange(removeSchemaNode(nodes, id))
    },
    [nodes, onChange],
  )

  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      onChange(reorderList(nodes, fromIndex, toIndex))
    },
    [nodes, onChange],
  )

  const handleAddField = useCallback(() => {
    onChange([...nodes, createEmptyField()])
  }, [nodes, onChange])

  const handleAddRepeat = useCallback(() => {
    onChange([...nodes, createEmptyRepeatBlock()])
  }, [nodes, onChange])

  const renderNode = (node: SchemaNode, index: number) => {
    const content = isRepeatNode(node) ? (
      <RepeatBlockEditor
        repeat={node}
        index={index}
        nodes={nodes}
        priorNumericFields={priorNumericFields}
        depth={depth}
        onRepeatChange={handleRepeatChange}
        onRepeatFieldsChange={handleRepeatFieldsChange}
        onRemove={handleRemoveNode}
      />
    ) : (
      <FieldRow
        field={node}
        index={index}
        nodes={nodes}
        priorNumericFields={priorNumericFields}
        onFieldChange={handleFieldChange}
        onRemove={handleRemoveNode}
      />
    )

    return (
      <SortableItem
        key={node.id}
        listId={sortListId}
        index={index}
        onReorder={handleReorder}
        testId={`${VALUE_DECODER_TEST_ID}-schema-item-${node.id}`}
      >
        {content}
      </SortableItem>
    )
  }

  const hasFieldNodes = nodes.some((node) => !isRepeatNode(node))

  return (
    <>
      {hasFieldNodes && (
        <S.FieldTableHeader>
          <span>Field Name</span>
          <span>Data Type</span>
          <span>Size</span>
          <span aria-hidden />
        </S.FieldTableHeader>
      )}

      {nodes.map((node, index) => renderNode(node, index))}

      <Row justify="end" align="center">
        <S.SchemaActions>
          <SecondaryButton
            size="s"
            onClick={handleAddField}
            data-testid={`${VALUE_DECODER_TEST_ID}-add-field-${depth}`}
          >
            Add Field
          </SecondaryButton>
          <SecondaryButton
            size="s"
            onClick={handleAddRepeat}
            data-testid={`${VALUE_DECODER_TEST_ID}-add-repeat-${depth}`}
          >
            Add Repeat
          </SecondaryButton>
        </S.SchemaActions>
      </Row>
    </>
  )
}
