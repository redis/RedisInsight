import {
  NUMERIC_COUNT_DATA_TYPES,
  createEmptyField,
  isFieldNode,
  isRepeatNode,
} from './constants'
import {
  BinaryFieldDefinition,
  FieldSizeSource,
  RepeatBlockDefinition,
  SchemaNode,
  ValueDecoderRule,
} from './types'

export interface NumericFieldRef {
  id: string
  name: string
  dataType: string
}

export const isNumericCountType = (dataType: string): boolean =>
  NUMERIC_COUNT_DATA_TYPES.includes(dataType as (typeof NUMERIC_COUNT_DATA_TYPES)[number])

export const normalizeFieldNode = (
  field: Partial<BinaryFieldDefinition> & { id: string },
): BinaryFieldDefinition => ({
  id: field.id,
  kind: 'field',
  name: field.name ?? '',
  dataType: field.dataType ?? 'uint8',
  size: field.size ?? '',
  sizeSource: field.sizeSource ?? 'fixed',
  sizeFieldRef: field.sizeFieldRef,
})

export const normalizeSchemaNode = (node: SchemaNode): SchemaNode => {
  if (isRepeatNode(node)) {
    return {
      ...node,
      kind: 'repeat',
      fields: (node.fields ?? []).map(normalizeSchemaNode),
    }
  }

  return normalizeFieldNode(node as BinaryFieldDefinition)
}

const normalizeKeyPatterns = (patterns: string[]): string[] =>
  patterns.filter((pattern) => pattern !== '')

export const getDecoderLabel = (decoder: ValueDecoderRule): string => {
  const normalized = normalizeRule(decoder)
  if (normalized.name.trim()) {
    return normalized.name.trim()
  }
  return normalized.keyPatterns[0] ?? 'Untitled decoder'
}

export const getPriorNumericFields = (
  schema: SchemaNode[],
  beforeNodeId: string,
): NumericFieldRef[] => {
  const result: NumericFieldRef[] = []

  const walk = (nodes: SchemaNode[]): boolean => {
    for (const node of nodes) {
      if (node.id === beforeNodeId) {
        return true
      }

      if (isFieldNode(node)) {
        if (node.name.trim() && isNumericCountType(node.dataType)) {
          result.push({
            id: node.id,
            name: node.name.trim(),
            dataType: node.dataType,
          })
        }
      } else if (isRepeatNode(node)) {
        if (walk(node.fields)) {
          return true
        }
      }
    }
    return false
  }

  walk(schema)
  return result
}

export const getPriorNumericFieldsForRepeat = (
  schema: SchemaNode[],
  repeatId: string,
): NumericFieldRef[] => getPriorNumericFields(schema, repeatId)

export const getPriorNumericFieldsInScope = (
  priorFields: NumericFieldRef[],
  siblingNodes: SchemaNode[],
  beforeIndex: number,
): NumericFieldRef[] => {
  const siblings = siblingNodes.slice(0, beforeIndex).flatMap((node) => {
    if (!isFieldNode(node) || !node.name.trim()) {
      return []
    }
    if (!isNumericCountType(node.dataType)) {
      return []
    }
    return [
      {
        id: node.id,
        name: node.name.trim(),
        dataType: node.dataType,
      },
    ]
  })

  return [...priorFields, ...siblings]
}

const resolveNumericFieldRef = (
  ref: string | undefined,
  priorFields: NumericFieldRef[],
): string | undefined => {
  if (!ref) {
    return ref
  }

  if (priorFields.some((item) => item.id === ref)) {
    return ref
  }

  const trimmedRef = ref.trim()
  const matchesByName = priorFields.filter((item) => item.name === trimmedRef)
  if (matchesByName.length === 1) {
    return matchesByName[0].id
  }

  return ref
}

const normalizeSchemaRefs = (
  nodes: SchemaNode[],
  priorFields: NumericFieldRef[] = [],
): SchemaNode[] =>
  nodes.map((node, index) => {
    const scopeNumeric = getPriorNumericFieldsInScope(
      priorFields,
      nodes,
      index,
    )

    if (isFieldNode(node)) {
      if (node.sizeSource !== 'field') {
        return node
      }

      return {
        ...node,
        sizeFieldRef: resolveNumericFieldRef(node.sizeFieldRef, scopeNumeric),
      }
    }

    if (isRepeatNode(node)) {
      return {
        ...node,
        countFieldRef:
          resolveNumericFieldRef(node.countFieldRef, scopeNumeric) ?? '',
        fields: normalizeSchemaRefs(node.fields, scopeNumeric),
      }
    }

    return node
  })

export const normalizeRule = (rule: ValueDecoderRule): ValueDecoderRule => {
  const schemaNodes =
    (rule.schema?.length ?? 0) > 0
      ? rule.schema!.map(normalizeSchemaNode)
      : (rule.fields ?? []).map((field) =>
          normalizeFieldNode({ ...field, id: field.id ?? `field-legacy-${field.name}` }),
        )
  const schema = normalizeSchemaRefs(schemaNodes)

  const keyPatterns =
    (rule.keyPatterns?.length ?? 0) > 0
      ? normalizeKeyPatterns(rule.keyPatterns)
      : rule.keyPattern != null && rule.keyPattern !== ''
        ? [rule.keyPattern]
        : []

  return {
    ...rule,
    name: rule.name ?? '',
    keyPatterns,
    schema,
    keyPattern: undefined,
    fields: undefined,
  }
}

const isPositiveIntegerSize = (size: number | ''): boolean => {
  const numericSize = Number(size)
  return Number.isInteger(numericSize) && numericSize > 0
}

const isFieldValid = (
  field: BinaryFieldDefinition,
  priorNumeric: NumericFieldRef[],
): boolean => {
  if (!field.name.trim()) {
    return false
  }

  if (field.dataType === 'string' || field.dataType === 'hex') {
    if (field.sizeSource === 'field') {
      return Boolean(
        field.sizeFieldRef &&
          priorNumeric.some((item) => item.id === field.sizeFieldRef),
      )
    }
    return isPositiveIntegerSize(field.size)
  }

  return isPositiveIntegerSize(field.size)
}

const isRepeatValid = (
  repeat: RepeatBlockDefinition,
  priorNumeric: NumericFieldRef[],
): boolean => {
  if (!repeat.countFieldRef) {
    return false
  }

  if (!priorNumeric.some((item) => item.id === repeat.countFieldRef)) {
    return false
  }

  return (
    repeat.fields.length > 0 &&
    repeat.fields.every((child, childIndex) =>
      isSchemaNodeValid(child, priorNumeric, repeat.fields, childIndex),
    )
  )
}

export const isSchemaNodeValid = (
  node: SchemaNode,
  priorNumeric: NumericFieldRef[],
  siblingNodes: SchemaNode[],
  index: number,
): boolean => {
  const scopeNumeric = getPriorNumericFieldsInScope(
    priorNumeric,
    siblingNodes,
    index,
  )

  if (isFieldNode(node)) {
    return isFieldValid(node, scopeNumeric)
  }

  if (isRepeatNode(node)) {
    return isRepeatValid(node, scopeNumeric)
  }

  return false
}

export const isSchemaValid = (schema: SchemaNode[]): boolean =>
  schema.length > 0 &&
  schema.every((node, index) => isSchemaNodeValid(node, [], schema, index))

export const isDecoderValid = (decoder: ValueDecoderRule): boolean => {
  const normalized = normalizeRule(decoder)
  return (
    normalized.keyPatterns.length > 0 && isSchemaValid(normalized.schema)
  )
}

export const areDecodersValid = (decoders: ValueDecoderRule[]): boolean =>
  decoders.length === 0 || decoders.every(isDecoderValid)

export const updateSchemaNode = (
  nodes: SchemaNode[],
  nodeId: string,
  updater: (node: SchemaNode) => SchemaNode,
): SchemaNode[] =>
  nodes.map((node) => {
    if (node.id === nodeId) {
      return updater(node)
    }
    if (isRepeatNode(node)) {
      return {
        ...node,
        fields: updateSchemaNode(node.fields, nodeId, updater),
      }
    }
    return node
  })

export const removeSchemaNode = (
  nodes: SchemaNode[],
  nodeId: string,
): SchemaNode[] => {
  const filtered = nodes.filter((node) => node.id !== nodeId)

  if (filtered.length !== nodes.length) {
    return filtered.length > 0 ? filtered : [createEmptyField()]
  }

  return nodes.map((node) => {
    if (isRepeatNode(node)) {
      const nextFields = removeSchemaNode(node.fields, nodeId)
      return { ...node, fields: nextFields }
    }
    return node
  })
}

export const insertSchemaNodeAt = (
  nodes: SchemaNode[],
  index: number,
  newNode: SchemaNode,
): SchemaNode[] => {
  const next = [...nodes]
  next.splice(index, 0, newNode)
  return next
}

export const isCustomSizeType = (dataType: string): boolean =>
  dataType === 'string' || dataType === 'hex'

export const resolveSizeSource = (
  field: BinaryFieldDefinition,
): FieldSizeSource =>
  isCustomSizeType(field.dataType) ? field.sizeSource ?? 'fixed' : 'fixed'
