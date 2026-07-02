import { DecoderType } from './types'
import { BinaryDataType } from './constants'

export const KEY_PATTERN_FIELD_DESCRIPTION =
  'Add one or more glob patterns to match Redis keys (e.g. user:items:*, room:chunk-state:*). A decoder applies when any pattern matches.'

export const DECODER_TYPE_DESCRIPTIONS: Record<DecoderType, string> = {
  [DecoderType.Binary]:
    'Parses the value as a sequential binary structure using the field layout defined below.',
}

export const DATA_TYPE_DESCRIPTIONS: Record<BinaryDataType, string> = {
  uint8: 'Unsigned 8-bit integer (1 byte).',
  int8: 'Signed 8-bit integer (1 byte).',
  boolean: 'Boolean stored as 1 byte (0 = false, non-zero = true).',
  uint16le: 'Unsigned 16-bit integer, little-endian (2 bytes).',
  uint16be: 'Unsigned 16-bit integer, big-endian (2 bytes).',
  int16le: 'Signed 16-bit integer, little-endian (2 bytes).',
  int16be: 'Signed 16-bit integer, big-endian (2 bytes).',
  uint32le: 'Unsigned 32-bit integer, little-endian (4 bytes).',
  uint32be: 'Unsigned 32-bit integer, big-endian (4 bytes).',
  int32le: 'Signed 32-bit integer, little-endian (4 bytes).',
  int32be: 'Signed 32-bit integer, big-endian (4 bytes).',
  floatle: '32-bit IEEE 754 float, little-endian (4 bytes).',
  floatbe: '32-bit IEEE 754 float, big-endian (4 bytes).',
  bigint64le: 'Signed 64-bit integer, little-endian (8 bytes).',
  bigint64be: 'Signed 64-bit integer, big-endian (8 bytes).',
  biguint64le: 'Unsigned 64-bit integer, little-endian (8 bytes).',
  biguint64be: 'Unsigned 64-bit integer, big-endian (8 bytes).',
  doublele: '64-bit IEEE 754 double, little-endian (8 bytes).',
  doublebe: '64-bit IEEE 754 double, big-endian (8 bytes).',
  string: 'UTF-8 string with a custom byte length.',
  hex: 'Raw bytes rendered as hexadecimal with a custom byte length.',
}
