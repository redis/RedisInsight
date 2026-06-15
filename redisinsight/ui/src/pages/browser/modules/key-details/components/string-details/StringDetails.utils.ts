import {
  bufferToSerializedFormat,
  formattingBuffer,
  Nullable,
} from 'uiSrc/utils'
import { decompressingBuffer } from 'uiSrc/utils/decompressors'
import { KeyValueCompressor, KeyValueFormat } from 'uiSrc/constants'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

/**
 * Builds the text for the String "Copy value" action so it matches what the
 * value panel shows. `formattingBuffer` is the same helper the panel renders
 * with: for text/decoded formats (Unicode, ASCII, HEX, Binary, DateTime, …) it
 * returns the displayed string, which we copy directly; for the formats it
 * renders as a JSON tree we fall back to the serialized text form.
 */
export const getStringCopyValue = (
  value: Nullable<RedisResponseBuffer> | undefined,
  format: KeyValueFormat,
  compressor: Nullable<KeyValueCompressor> = null,
): string => {
  if (!value) {
    return ''
  }

  const decompressedValue = decompressingBuffer(value, compressor)
    .value as RedisResponseBuffer
  const displayedValue = formattingBuffer(decompressedValue, format, {
    expanded: true,
  }).value

  // Text/decoded formats already return the displayed string.
  if (typeof displayedValue === 'string') {
    return displayedValue
  }

  // The value is rendered as a JSON tree; copy its serialized text form.
  // bufferToSerializedFormat returns a typed array (Float32Array/Float64Array)
  // for the Vector formats, which the clipboard would stringify as "1,2" rather
  // than the displayed JSON array, so coerce any non-string result to JSON.
  const serialized: unknown = bufferToSerializedFormat(
    format,
    decompressedValue,
    4,
  )

  return typeof serialized === 'string'
    ? serialized
    : JSON.stringify(Array.from(serialized as Iterable<number>))
}
