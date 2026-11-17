import { useCallback } from 'react'

import { createEmptyField, createEmptyRepeatBlock } from './constants'
import { reorderList } from './reorderList'
import {
  isCustomSizeType,
  removeSchemaNode,
  updateSchemaNode,
} from './schemaUtils'
import { BinaryFieldDefinition, SchemaNode } from './types'
import { getFixedSize } from './utils'

export const applyFieldChange = (
  nodes: SchemaNode[],
  id: string,
  patch: Partial<BinaryFieldDefinition>,
): SchemaNode[] =>
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
  })

export const applyRepeatChange = (
  nodes: SchemaNode[],
  id: string,
  patch: Partial<{ countFieldRef: string }>,
): SchemaNode[] =>
  updateSchemaNode(nodes, id, (node) => {
    if (node.kind !== 'repeat') {
      return node
    }
    return { ...node, ...patch }
  })

export const applyRepeatFieldsChange = (
  nodes: SchemaNode[],
  repeatId: string,
  fields: SchemaNode[],
): SchemaNode[] =>
  updateSchemaNode(nodes, repeatId, (node) => {
    if (node.kind !== 'repeat') {
      return node
    }
    return { ...node, fields }
  })

export const applyRemoveNode = (
  nodes: SchemaNode[],
  id: string,
): SchemaNode[] => removeSchemaNode(nodes, id)

export const applyReorder = (
  nodes: SchemaNode[],
  fromIndex: number,
  toIndex: number,
): SchemaNode[] => reorderList(nodes, fromIndex, toIndex)

export const applyAddField = (nodes: SchemaNode[]): SchemaNode[] => [
  ...nodes,
  createEmptyField(),
]

export const applyAddRepeat = (nodes: SchemaNode[]): SchemaNode[] => [
  ...nodes,
  createEmptyRepeatBlock(),
]

export interface UseSchemaEditorParams {
  nodes: SchemaNode[]
  onChange: (nodes: SchemaNode[]) => void
}

export interface UseSchemaEditorResult {
  handleFieldChange: (id: string, patch: Partial<BinaryFieldDefinition>) => void
  handleRepeatChange: (
    id: string,
    patch: Partial<{ countFieldRef: string }>,
  ) => void
  handleRepeatFieldsChange: (repeatId: string, fields: SchemaNode[]) => void
  handleRemoveNode: (id: string) => void
  handleReorder: (fromIndex: number, toIndex: number) => void
  handleAddField: () => void
  handleAddRepeat: () => void
}

export const useSchemaEditor = ({
  nodes,
  onChange,
}: UseSchemaEditorParams): UseSchemaEditorResult => {
  const handleFieldChange = useCallback(
    (id: string, patch: Partial<BinaryFieldDefinition>) => {
      onChange(applyFieldChange(nodes, id, patch))
    },
    [nodes, onChange],
  )

  const handleRepeatChange = useCallback(
    (id: string, patch: Partial<{ countFieldRef: string }>) => {
      onChange(applyRepeatChange(nodes, id, patch))
    },
    [nodes, onChange],
  )

  const handleRepeatFieldsChange = useCallback(
    (repeatId: string, fields: SchemaNode[]) => {
      onChange(applyRepeatFieldsChange(nodes, repeatId, fields))
    },
    [nodes, onChange],
  )

  const handleRemoveNode = useCallback(
    (id: string) => {
      onChange(applyRemoveNode(nodes, id))
    },
    [nodes, onChange],
  )

  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      onChange(applyReorder(nodes, fromIndex, toIndex))
    },
    [nodes, onChange],
  )

  const handleAddField = useCallback(() => {
    onChange(applyAddField(nodes))
  }, [nodes, onChange])

  const handleAddRepeat = useCallback(() => {
    onChange(applyAddRepeat(nodes))
  }, [nodes, onChange])

  return {
    handleFieldChange,
    handleRepeatChange,
    handleRepeatFieldsChange,
    handleRemoveNode,
    handleReorder,
    handleAddField,
    handleAddRepeat,
  }
}
