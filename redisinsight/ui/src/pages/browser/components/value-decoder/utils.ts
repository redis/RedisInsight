import { bufferToUint8Array } from 'uiSrc/utils/formatters/bufferFormatters'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

import { BinaryDataType, isRepeatNode, MAX_REPEAT_DECODE_ITERATIONS } from './constants'
import { isNumericCountType } from './schemaUtils'
import {
  BinaryFieldDefinition,
  ParsedBinaryField,
  ParsedBinaryNode,
  SchemaNode,
  ValueDecoderRule,
} from './types'

export const getFixedSize = (type: string): number | 'custom' => {
  if (['uint8', 'int8', 'boolean'].includes(type)) return 1
  if (['uint16le', 'uint16be', 'int16le', 'int16be'].includes(type)) return 2
  if (
    ['uint32le', 'uint32be', 'int32le', 'int32be', 'floatle', 'floatbe'].includes(
      type,
    )
  ) {
    return 4
  }
  if (
    [
      'bigint64le',
      'bigint64be',
      'biguint64le',
      'biguint64be',
      'doublele',
      'doublebe',
    ].includes(type)
  ) {
    return 8
  }
  return 'custom'
}

export const formatHexBytes = (bytes: Uint8Array | Iterable<number>): string =>
  Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0').toUpperCase())
    .join(' ')

const REGEX_SPECIAL_CHARS = /[.+^${}()|[\]\\]/g

const GLOB_ESCAPABLE_CHARS = new Set(['*', '?', '\\', '[', ']'])

const escapeRegexLiteral = (char: string): string =>
  char.replace(REGEX_SPECIAL_CHARS, '\\$&')

const escapeRegexCharacterClassMember = (char: string): string => {
  if (char === '-' || char === ']' || char === '\\' || char === '^') {
    return `\\${char}`
  }

  return escapeRegexLiteral(char)
}

export const escapeGlobPattern = (literal: string): string =>
  literal.replace(/[\\*?\[\]]/g, '\\$&')

const parseGlobCharacterClass = (
  pattern: string,
  startIndex: number,
): { regex: string; nextIndex: number } | null => {
  let index = startIndex + 1
  if (index >= pattern.length) {
    return null
  }

  let negated = false
  if (pattern[index] === '^') {
    negated = true
    index += 1
  }

  if (index >= pattern.length) {
    return null
  }

  const classParts: string[] = []
  let closed = false

  if (pattern[index] === ']') {
    classParts.push(escapeRegexCharacterClassMember(']'))
    index += 1
  }

  while (index < pattern.length) {
    const char = pattern[index]

    if (char === '\\' && index + 1 < pattern.length) {
      classParts.push(escapeRegexCharacterClassMember(pattern[index + 1]))
      index += 2
      continue
    }

    if (char === ']') {
      index += 1
      closed = true
      break
    }

    if (
      index + 2 < pattern.length &&
      pattern[index + 1] === '-' &&
      pattern[index + 2] !== ']'
    ) {
      const rangeStart = pattern[index]
      const rangeEnd = pattern[index + 2]
      classParts.push(
        `${escapeRegexLiteral(rangeStart)}-${escapeRegexLiteral(rangeEnd)}`,
      )
      index += 3
      continue
    }

    classParts.push(escapeRegexCharacterClassMember(char))
    index += 1
  }

  if (!closed || classParts.length === 0) {
    return null
  }

  const body = classParts.join('')
  return {
    regex: negated ? `[^${body}]` : `[${body}]`,
    nextIndex: index,
  }
}

export const getDefaultKeyPattern = (keyName: string): string =>
  escapeGlobPattern(keyName)

export const matchKeyPattern = (pattern: string, keyName: string): boolean => {
  if (!pattern) return false

  let regex = ''
  for (let i = 0; i < pattern.length; i += 1) {
    const char = pattern[i]

    if (char === '\\' && i + 1 < pattern.length) {
      const next = pattern[i + 1]
      if (GLOB_ESCAPABLE_CHARS.has(next)) {
        regex += escapeRegexLiteral(next)
        i += 1
        continue
      }
    }

    if (char === '*') {
      regex += '.*'
      continue
    }

    if (char === '?') {
      regex += '.'
      continue
    }

    if (char === '[') {
      const characterClass = parseGlobCharacterClass(pattern, i)
      if (characterClass) {
        regex += characterClass.regex
        i = characterClass.nextIndex - 1
        continue
      }
    }

    regex += escapeRegexLiteral(char)
  }

  try {
    return new RegExp(`^${regex}$`).test(keyName)
  } catch {
    return false
  }
}

export const getSizeUnit = (size: number | ''): string => {
  const numericSize = Number(size)
  if (!numericSize || numericSize <= 0) {
    return 'bytes'
  }
  return numericSize === 1 ? 'byte' : 'bytes'
}

export const getKeyPatternSpecificity = (pattern: string): number => {
  if (!pattern) {
    return -1
  }

  let score = 0
  let index = 0

  while (index < pattern.length) {
    const char = pattern[index]

    if (char === '\\' && index + 1 < pattern.length) {
      score += 4
      index += 2
      continue
    }

    if (char === '*') {
      score += 1
      index += 1
      continue
    }

    if (char === '?') {
      score += 2
      index += 1
      continue
    }

    if (char === '[') {
      const characterClass = parseGlobCharacterClass(pattern, index)
      if (characterClass) {
        score += 3
        index = characterClass.nextIndex
        continue
      }
    }

    score += 4
    index += 1
  }

  return score
}

export const findMatchingDecoderRule = (
  rules: ValueDecoderRule[],
  keyName: string,
): ValueDecoderRule | null => {
  let bestRule: ValueDecoderRule | null = null
  let bestScore = -1

  rules.forEach((rule) => {
    const ruleScore = rule.keyPatterns.reduce((maxScore, pattern) => {
      if (!matchKeyPattern(pattern, keyName)) {
        return maxScore
      }

      return Math.max(maxScore, getKeyPatternSpecificity(pattern))
    }, -1)

    if (ruleScore > bestScore) {
      bestScore = ruleScore
      bestRule = rule
    }
  })

  return bestRule
}

const readNumericValue = (
  view: DataView,
  offset: number,
  type: BinaryDataType,
): string => {
  switch (type) {
    case 'uint8':
      return String(view.getUint8(offset))
    case 'int8':
      return String(view.getInt8(offset))
    case 'boolean':
      return view.getUint8(offset) ? 'true' : 'false'
    case 'uint16le':
      return String(view.getUint16(offset, true))
    case 'uint16be':
      return String(view.getUint16(offset, false))
    case 'int16le':
      return String(view.getInt16(offset, true))
    case 'int16be':
      return String(view.getInt16(offset, false))
    case 'uint32le':
      return String(view.getUint32(offset, true))
    case 'uint32be':
      return String(view.getUint32(offset, false))
    case 'int32le':
      return String(view.getInt32(offset, true))
    case 'int32be':
      return String(view.getInt32(offset, false))
    case 'floatle':
      return String(view.getFloat32(offset, true))
    case 'floatbe':
      return String(view.getFloat32(offset, false))
    case 'bigint64le':
      return view.getBigInt64(offset, true).toString()
    case 'bigint64be':
      return view.getBigInt64(offset, false).toString()
    case 'biguint64le':
      return view.getBigUint64(offset, true).toString()
    case 'biguint64be':
      return view.getBigUint64(offset, false).toString()
    case 'doublele':
      return String(view.getFloat64(offset, true))
    case 'doublebe':
      return String(view.getFloat64(offset, false))
    default:
      return ''
  }
}

const parseNumericForRef = (value: string, dataType: string): number => {
  if (!isNumericCountType(dataType)) {
    return 0
  }

  if (dataType.includes('bigint') || dataType.includes('biguint')) {
    try {
      return Number(BigInt(value))
    } catch {
      return 0
    }
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return 0
  }

  return Math.max(0, Math.floor(parsed))
}

const resolveFieldSize = (
  field: BinaryFieldDefinition,
  parsedNumeric: Map<string, number>,
): number => {
  if (field.dataType === 'string' || field.dataType === 'hex') {
    if (field.sizeSource === 'field' && field.sizeFieldRef) {
      return parsedNumeric.get(field.sizeFieldRef) ?? 0
    }
    return Number(field.size) || 0
  }

  const fixedSize = getFixedSize(field.dataType)
  if (fixedSize === 'custom') {
    return Number(field.size) || 0
  }
  return fixedSize
}

export const resolveRepeatCount = (rawCount: number | undefined): number => {
  const normalized = rawCount ?? 0
  if (!Number.isFinite(normalized)) {
    return 0
  }

  return Math.min(
    MAX_REPEAT_DECODE_ITERATIONS,
    Math.max(0, Math.floor(normalized)),
  )
}

const parseFieldNode = (
  buffer: Uint8Array,
  view: DataView,
  field: BinaryFieldDefinition,
  offset: number,
  parsedNumeric: Map<string, number>,
): { result: ParsedBinaryField | null; offset: number } => {
  const size = resolveFieldSize(field, parsedNumeric)

  if (!field.name || size < 0) {
    return { result: null, offset }
  }

  if (size === 0) {
    return {
      result: {
        kind: 'field',
        name: field.name,
        size: 0,
        value: '',
      },
      offset,
    }
  }

  if (offset + size > buffer.length) {
    return {
      result: {
        kind: 'field',
        name: field.name,
        size,
        value: '<insufficient data>',
      },
      offset,
    }
  }

  let value = ''
  if (field.dataType === 'string') {
    value = new TextDecoder('utf-8').decode(buffer.slice(offset, offset + size))
  } else if (field.dataType === 'hex') {
    value = formatHexBytes(buffer.slice(offset, offset + size))
  } else {
    value = readNumericValue(view, offset, field.dataType as BinaryDataType)
  }

  const numericValue = parseNumericForRef(value, field.dataType)
  if (isNumericCountType(field.dataType)) {
    parsedNumeric.set(field.id, numericValue)
  }

  return {
    result: { kind: 'field', name: field.name, size, value },
    offset: offset + size,
  }
}

const hasInsufficientData = (nodes: ParsedBinaryNode[]): boolean =>
  nodes.some((node) => {
    if (node.kind === 'field') {
      return node.value === '<insufficient data>'
    }
    return hasInsufficientData(node.children)
  })

type DecodeBudget = {
  remainingGroupSlots: number
}

const parseSchemaNodes = (
  buffer: Uint8Array,
  view: DataView,
  nodes: SchemaNode[],
  offset: number,
  parsedNumeric: Map<string, number>,
  decodeBudget: DecodeBudget,
): { results: ParsedBinaryNode[]; offset: number } => {
  let currentOffset = offset
  const results: ParsedBinaryNode[] = []

  for (const node of nodes) {
    if (node.kind === 'field' || !isRepeatNode(node)) {
      const field = node as BinaryFieldDefinition
      const { result, offset: nextOffset } = parseFieldNode(
        buffer,
        view,
        field,
        currentOffset,
        parsedNumeric,
      )
      if (result) {
        results.push(result)
        if (result.value === '<insufficient data>') {
          return { results, offset: currentOffset }
        }
      }
      currentOffset = nextOffset
      continue
    }

    const repeatCount = Math.min(
      resolveRepeatCount(parsedNumeric.get(node.countFieldRef)),
      decodeBudget.remainingGroupSlots,
    )

    for (let index = 0; index < repeatCount; index += 1) {
      if (decodeBudget.remainingGroupSlots <= 0) {
        break
      }

      decodeBudget.remainingGroupSlots -= 1

      const iterationScope = new Map(parsedNumeric)
      const { results: childResults, offset: nextOffset } = parseSchemaNodes(
        buffer,
        view,
        node.fields,
        currentOffset,
        iterationScope,
        decodeBudget,
      )

      results.push({
        kind: 'group',
        label: String(index),
        children: childResults,
      })
      currentOffset = nextOffset

      if (hasInsufficientData(childResults)) {
        return { results, offset: currentOffset }
      }
    }
  }

  return { results, offset: currentOffset }
}

export const formatParsedFieldLine = (field: ParsedBinaryField): string =>
  `[${field.name}] [${field.size}] [${field.value}]`

export const formatParsedFields = (nodes: ParsedBinaryNode[]): string => {
  const lines: string[] = []

  const walk = (items: ParsedBinaryNode[], depth: number) => {
    items.forEach((node) => {
      if (node.kind === 'group') {
        lines.push(`${'  '.repeat(depth + 1)}[${node.label}]`)
        walk(node.children, depth + 2)
        return
      }

      lines.push(`${'  '.repeat(depth)}${formatParsedFieldLine(node)}`)
    })
  }

  walk(nodes, 0)
  return lines.join('\n')
}

export const formatParsedFieldsInline = (nodes: ParsedBinaryNode[]): string => {
  const parts: string[] = []

  const walk = (items: ParsedBinaryNode[]) => {
    items.forEach((node) => {
      if (node.kind === 'group') {
        parts.push(`[${node.label}]`)
        walk(node.children)
        return
      }

      parts.push(formatParsedFieldLine(node))
    })
  }

  walk(nodes)
  return parts.join(' ')
}

export const parseBinaryBuffer = (
  buffer: Uint8Array,
  schema: SchemaNode[],
): ParsedBinaryNode[] =>
  parseSchemaNodes(
    buffer,
    new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength),
    schema,
    0,
    new Map(),
    { remainingGroupSlots: MAX_REPEAT_DECODE_ITERATIONS },
  ).results

export const parseBufferWithRule = (
  buffer: RedisResponseBuffer,
  schema: SchemaNode[],
): ParsedBinaryNode[] =>
  parseBinaryBuffer(bufferToUint8Array(buffer), schema)
