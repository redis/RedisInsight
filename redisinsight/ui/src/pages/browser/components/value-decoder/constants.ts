import {
  BinaryFieldDefinition,
  RepeatBlockDefinition,
  SchemaNode,
  ValueDecoderRule,
} from './types'
import { DecoderType } from './types'

export const VALUE_DECODER_TEST_ID = 'value-decoder'

export const MAX_REPEAT_DECODE_ITERATIONS = 1000

export const BINARY_DATA_TYPES = [
  'uint8',
  'int8',
  'boolean',
  'uint16le',
  'uint16be',
  'int16le',
  'int16be',
  'uint32le',
  'uint32be',
  'int32le',
  'int32be',
  'floatle',
  'floatbe',
  'bigint64le',
  'bigint64be',
  'biguint64le',
  'biguint64be',
  'doublele',
  'doublebe',
  'string',
  'hex',
] as const

export type BinaryDataType = (typeof BINARY_DATA_TYPES)[number]

export const NUMERIC_COUNT_DATA_TYPES = [
  'uint8',
  'int8',
  'uint16le',
  'uint16be',
  'int16le',
  'int16be',
  'uint32le',
  'uint32be',
  'int32le',
  'int32be',
  'bigint64le',
  'bigint64be',
  'biguint64le',
  'biguint64be',
] as const

export const SIZE_SOURCE_OPTIONS = [
  { value: 'fixed', label: 'Fixed bytes' },
  { value: 'field', label: 'From field' },
]

export const DECODER_TYPE_OPTIONS = [
  { value: DecoderType.Binary, content: 'Binary Decoder' },
]

let fieldIdCounter = 0

const nextId = (prefix: string) => {
  fieldIdCounter += 1
  return `${prefix}-${fieldIdCounter}-${Date.now()}`
}

export const createEmptyField = (): BinaryFieldDefinition => ({
  id: nextId('field'),
  kind: 'field',
  name: '',
  dataType: 'uint8',
  size: 1,
  sizeSource: 'fixed',
})

export const createEmptyRepeatBlock = (): RepeatBlockDefinition => ({
  id: nextId('repeat'),
  kind: 'repeat',
  name: '',
  countFieldRef: '',
  fields: [createEmptyField()],
})

export const createEmptyDecoder = (keyName = ''): ValueDecoderRule => ({
  id: nextId('decoder'),
  name: '',
  keyPatterns: keyName ? [keyName] : [''],
  decoderType: DecoderType.Binary,
  schema: [createEmptyField()],
})

export const isRepeatNode = (node: SchemaNode): node is RepeatBlockDefinition =>
  node.kind === 'repeat'

export const isFieldNode = (node: SchemaNode): node is BinaryFieldDefinition =>
  node.kind === 'field' || !('kind' in node)
