import React from 'react'

import {
  TEXT_FAILED_CONVENT_FORMATTER,
  TEXT_INVALID_VALUE,
  TEXT_UNPRINTABLE_CHARACTERS,
} from 'uiSrc/constants'
import {
  createTooltipContent,
  formattingBuffer,
  stringToSerializedBufferFormat,
} from 'uiSrc/utils'
import {
  EditableTextArea,
  FormattedValue,
} from 'uiSrc/pages/browser/modules/key-details/shared'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

import { getArrayElementEditState } from '../getArrayElementEditState'
import { ArrayValueCellProps } from './ArrayValueCell.types'
import * as S from './ArrayValueCell.styles'

const TEST_ID_PREFIX = 'array-details-table'

/**
 * Renders a populated slot's value (formatted). When the row is in edit mode
 * it hosts the inline editor (ARSET). Empty slots render a muted "Empty"
 * marker and are not editable — filling a gap changes ARCOUNT/ARLEN and
 * belongs to append / set-at-index, not the value edit.
 *
 * The edit / expand triggers live in the table's actions column
 * (`RowActionsCell`), not here, so the value column stays clear for text —
 * hence `hideEditButton` on the editor. Editing is driven from that column via
 * the table-level `editingIndex`; this cell only reacts to `isEditing`.
 */
export const ArrayValueCell = ({
  index,
  value,
  compressor,
  viewFormat,
  isEditing = false,
  updating = false,
  loading = false,
  onEdit,
  onApply,
}: ArrayValueCellProps) => {
  // Treat null and undefined identically — `JSON.stringify` drops keys
  // whose values are undefined, so an undefined `value` here means the
  // slot arrived without a buffer payload.
  if (value == null) {
    return (
      <S.EmptyValue
        variant="italic"
        data-testid={`${TEST_ID_PREFIX}-empty-${index}`}
      >
        Empty
      </S.EmptyValue>
    )
  }

  // Values flow through the API in `encoding=buffer` mode, so we narrow
  // RedisString to RedisResponseBuffer at the rendering boundary.
  const buffer = value as RedisResponseBuffer
  const { decompressedBuffer, formatted, isValid, isUnprintable, serialize } =
    getArrayElementEditState(buffer, compressor, viewFormat)
  const tooltipContent = createTooltipContent(
    formatted,
    decompressedBuffer,
    viewFormat,
  )
  const serializedValue = isEditing ? serialize() : ''

  return (
    <EditableTextArea
      initialValue={serializedValue}
      isEditing={isEditing}
      // Lock the open editor's Save while a write OR a patched-view read is in
      // flight: a read that began just before the refresh-disabled flag took
      // effect could otherwise be Saved into and overwrite the patch.
      isLoading={updating || loading}
      isDisabled={isUnprintable}
      disabledTooltipText={TEXT_UNPRINTABLE_CHARACTERS}
      approveText={TEXT_INVALID_VALUE}
      approveByValidation={(editedValue) =>
        !!formattingBuffer(
          stringToSerializedBufferFormat(viewFormat, editedValue),
          viewFormat,
        )?.isValid
      }
      hideEditButton
      onEdit={(editing) => onEdit?.(editing)}
      onDecline={() => onEdit?.(false)}
      onApply={(editedValue) => onApply?.(editedValue)}
      field={index}
      testIdPrefix={TEST_ID_PREFIX}
    >
      <div
        className="innerCellAsCell"
        data-testid={`${TEST_ID_PREFIX}-value-${index}`}
      >
        <FormattedValue
          value={formatted}
          expanded={false}
          title={isValid ? 'Value' : TEXT_FAILED_CONVENT_FORMATTER(viewFormat)}
          tooltipContent={tooltipContent}
          position="bottom"
        />
      </div>
    </EditableTextArea>
  )
}
