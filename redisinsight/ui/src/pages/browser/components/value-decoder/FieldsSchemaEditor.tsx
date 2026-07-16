import React, { useCallback } from 'react'

import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { Row } from 'uiSrc/components/base/layout/flex'

import {
  createEmptyField,
  createEmptyRepeatBlock,
  isRepeatNode,
  VALUE_DECODER_TEST_ID,
} from './constants'
import { FieldRow } from './FieldRow'
import { RepeatBlockEditor } from './RepeatBlockEditor'
import {
  getPriorNumericFieldsInScope,
  isCustomSizeType,
  NumericFieldRef,
  removeSchemaNode,
  updateSchemaNode,
} from './schemaUtils'
import { reorderList } from './reorderList'
import { SortableItem } from './SortableItem'
import { BinaryFieldDefinition, SchemaNode } from './types'
import { getFixedSize } from './utils'
import * as S from './ValueDecoderModal.styles'

export interface FieldsSchemaEditorProps {
  sortListId: string
  nodes: SchemaNode[]
  onChange: (nodes: SchemaNode[]) => void
  priorNumericFields?: NumericFieldRef[]
  depth?: number
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
    const repeatScopeNumeric = getPriorNumericFieldsInScope(
      priorNumericFields,
      nodes,
      index,
    )

    const content = isRepeatNode(node) ? (
      <RepeatBlockEditor
        repeat={node}
        index={index}
        nodes={nodes}
        priorNumericFields={priorNumericFields}
        depth={depth}
        onRepeatChange={handleRepeatChange}
        onRemove={handleRemoveNode}
      >
        <FieldsSchemaEditor
          sortListId={`repeat-${node.id}`}
          nodes={node.fields}
          onChange={(fields) => handleRepeatFieldsChange(node.id, fields)}
          priorNumericFields={repeatScopeNumeric}
          depth={depth + 1}
        />
      </RepeatBlockEditor>
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
