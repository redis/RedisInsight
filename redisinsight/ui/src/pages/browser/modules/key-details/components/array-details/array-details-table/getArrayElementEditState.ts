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
  decompressedBuffer: RedisResponseBuffer
  formatted: JSX.Element | string
  isValid: boolean
  isCompressed: boolean
  /** Editing a truncated value would save the truncated copy over the real one. */
  isTruncated: boolean
  /** Editor stays open but its input is disabled, to avoid silent data loss. */
  isUnprintable: boolean
  isEditable: boolean
  /** Trigger-tooltip text; null when editable. */
  editDisabledReason: Nullable<ReactNode>
  serialize: () => string
}

/**
 * Shared display + edit state for one populated array element. Centralised so
 * the value cell (display + inline editor) and the actions cell (edit/expand
 * triggers + drawer seed) can't drift apart. Callers must guard empty slots
 * (`value == null`) — an empty slot has nothing to format or edit.
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
