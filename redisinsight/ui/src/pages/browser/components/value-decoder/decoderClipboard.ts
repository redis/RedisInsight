import { isObjectLike } from 'lodash'

import { isFieldNode, isRepeatNode } from './constants'
import { normalizeRule } from './schemaUtils'
import { SchemaNode, ValueDecoderRule } from './types'

export const VALUE_DECODER_CLIPBOARD_TYPE = 'redisinsight/value-decoder'
export const VALUE_DECODER_CLIPBOARD_VERSION = 1

export interface ValueDecoderClipboardPayload {
  type: typeof VALUE_DECODER_CLIPBOARD_TYPE
  version: typeof VALUE_DECODER_CLIPBOARD_VERSION
  decoders: ValueDecoderRule[]
}

let idCounter = 0

const createId = (prefix: string) => {
  idCounter += 1
  return `${prefix}-${idCounter}-${Date.now()}`
}

const collectSchemaIds = (
  nodes: SchemaNode[],
  idMap: Map<string, string>,
): void => {
  nodes.forEach((node) => {
    if (!idMap.has(node.id)) {
      idMap.set(node.id, createId(isRepeatNode(node) ? 'repeat' : 'field'))
    }

    if (isRepeatNode(node)) {
      collectSchemaIds(node.fields, idMap)
    }
  })
}

const remapSchemaIds = (
  nodes: SchemaNode[],
  idMap: Map<string, string>,
): SchemaNode[] =>
  nodes.map((node) => {
    if (isFieldNode(node)) {
      return {
        ...node,
        id: idMap.get(node.id) ?? node.id,
        kind: 'field',
        sizeFieldRef: node.sizeFieldRef
          ? idMap.get(node.sizeFieldRef) ?? node.sizeFieldRef
          : undefined,
      }
    }

    return {
      ...node,
      id: idMap.get(node.id) ?? node.id,
      kind: 'repeat',
      countFieldRef: idMap.get(node.countFieldRef) ?? node.countFieldRef,
      fields: remapSchemaIds(node.fields, idMap),
    }
  })

export const cloneDecoderRule = (rule: ValueDecoderRule): ValueDecoderRule => {
  const normalized = normalizeRule(rule)
  const idMap = new Map<string, string>()

  collectSchemaIds(normalized.schema, idMap)

  return {
    ...normalized,
    id: createId('decoder'),
    schema: remapSchemaIds(normalized.schema, idMap),
  }
}

const toClipboardDecoder = (decoder: ValueDecoderRule): ValueDecoderRule =>
  normalizeRule(decoder)

export const serializeDecodersForClipboard = (
  decoders: ValueDecoderRule[],
): string => {
  const payload: ValueDecoderClipboardPayload = {
    type: VALUE_DECODER_CLIPBOARD_TYPE,
    version: VALUE_DECODER_CLIPBOARD_VERSION,
    decoders: decoders.map(toClipboardDecoder),
  }

  return JSON.stringify(payload, null, 2)
}

export const serializeDecoderForClipboard = (decoder: ValueDecoderRule): string =>
  serializeDecodersForClipboard([decoder])

const isDecoderLike = (value: unknown): value is Record<string, unknown> => {
  if (!isObjectLike(value)) {
    return false
  }

  return (
    Array.isArray(value.keyPatterns) ||
    typeof value.keyPattern === 'string' ||
    Array.isArray(value.schema) ||
    Array.isArray(value.fields)
  )
}

const parseDecoderCandidates = (parsed: unknown): unknown[] => {
  if (Array.isArray(parsed)) {
    return parsed
  }

  if (!isObjectLike(parsed)) {
    return []
  }

  if (
    parsed.type === VALUE_DECODER_CLIPBOARD_TYPE &&
    Array.isArray(parsed.decoders)
  ) {
    return parsed.decoders
  }

  if (isDecoderLike(parsed)) {
    return [parsed]
  }

  return []
}

export const parseDecodersFromClipboard = (
  text: string,
): ValueDecoderRule[] | null => {
  const trimmed = text.trim()

  if (!trimmed) {
    return null
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown
    const candidates = parseDecoderCandidates(parsed)

    if (!candidates.length) {
      return null
    }

    const decoders = candidates
      .filter(isDecoderLike)
      .map((candidate) => cloneDecoderRule(candidate as ValueDecoderRule))

    return decoders.length > 0 ? decoders : null
  } catch {
    return null
  }
}
