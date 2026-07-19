import React from 'react'

import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { Row } from 'uiSrc/components/base/layout/flex'

import { isRepeatNode, VALUE_DECODER_TEST_ID } from './constants'
import { FieldRow } from './FieldRow'
import { RepeatBlockEditor } from './RepeatBlockEditor'
import { getPriorNumericFieldsInScope, NumericFieldRef } from './schemaUtils'
import { SortableItem } from './SortableItem'
import { SchemaNode } from './types'
import { useSchemaEditor } from './useSchemaEditor'
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
  const {
    handleFieldChange,
    handleRepeatChange,
    handleRepeatFieldsChange,
    handleRemoveNode,
    handleReorder,
    handleAddField,
    handleAddRepeat,
  } = useSchemaEditor({ nodes, onChange })

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
