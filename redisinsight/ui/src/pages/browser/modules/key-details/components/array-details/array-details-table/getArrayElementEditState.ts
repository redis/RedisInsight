import { ReactNode } from 'react'

import {
  KeyValueCompressor,
  KeyValueFormat,
  TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA,
  TEXT_DISABLED_COMPRESSED_VALUE,
  TEXT_DISABLED_FORMATTER_EDITING,
} from 'uiSrc/constants'
import {
  bufferToSerializedFormat,
  bufferToString,
  formattingBuffer,
  isEqualBuffers,
  isFormatEditable,
  isNonUnicodeFormatter,
  isTruncatedString,
  stringToBuffer,
  Nullable,
} from 'uiSrc/utils'
import { decompressingBuffer } from 'uiSrc/utils/decompressors'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

export interface ArrayElementEditState {
  /** The value after decompression — what both display and editing operate on. */
  decompressedBuffer: RedisResponseBuffer
  /** Formatter output for the current view format, and whether it round-trips. */
  formatted: JSX.Element | string
  isValid: boolean
  /** True when the payload is compressed (can't be edited safely). */
  isCompressed: boolean
  /** True when the backend truncated the value (editing would save the
   *  truncated copy back over the real element). */
  isTruncated: boolean
  /** True when the value contains non-printable characters — the editor stays
   *  open but its input is disabled to avoid silent data loss. */
  isUnprintable: boolean
  /** True when the value can be opened for editing at all. */
  isEditable: boolean
  /** Why editing is disabled, for the trigger tooltip; null when editable. */
  editDisabledReason: Nullable<ReactNode>
  /** Serialized editor seed for the current format (indent 4). */
  serialize: () => string
}

/**
 * Derives the shared display + edit state for a single populated array element
 * from its raw buffer. Centralises the compression / truncation / format
 * checks so the value cell (display + inline editor) and the actions cell
 * (edit / expand triggers + modal seed) can't drift apart.
 *
 * Callers must guard empty slots (`value == null`) before calling — an empty
 * slot has nothing to format or edit.
 */
export const getArrayElementEditState = (
  value: RedisResponseBuffer,
  compressor: Nullable<KeyValueCompressor>,
  viewFormat: KeyValueFormat,
): ArrayElementEditState => {
  const { value: decompressed, isCompressed } = decompressingBuffer(
    value,
    compressor,
  )
  const decompressedBuffer = decompressed as RedisResponseBuffer
  const { value: formatted, isValid } = formattingBuffer(
    decompressedBuffer,
    viewFormat,
    { expanded: false },
  )

  const isTruncated = isTruncatedString(value)
  const isFormatEditableValue = isFormatEditable(viewFormat)
  const isEditable = !isCompressed && !isTruncated && isFormatEditableValue
  const isUnprintable =
    !isNonUnicodeFormatter(viewFormat, isValid) &&
    !isEqualBuffers(decompressedBuffer, stringToBuffer(bufferToString(value)))

  let editDisabledReason: Nullable<ReactNode> = null
  if (isCompressed) {
    editDisabledReason = TEXT_DISABLED_COMPRESSED_VALUE
  } else if (isTruncated) {
    editDisabledReason = TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA
  } else if (!isFormatEditableValue) {
    editDisabledReason = TEXT_DISABLED_FORMATTER_EDITING
  }

  return {
    decompressedBuffer,
    formatted,
    isValid,
    isCompressed,
    isTruncated,
    isUnprintable,
    isEditable,
    editDisabledReason,
    serialize: () =>
      bufferToSerializedFormat(viewFormat, decompressedBuffer, 4),
  }
}
