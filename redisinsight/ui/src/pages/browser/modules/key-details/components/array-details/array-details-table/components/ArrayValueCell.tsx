import React, { useState } from 'react'

import {
  TEXT_DISABLED_COMPRESSED_VALUE,
  TEXT_DISABLED_FORMATTER_EDITING,
  TEXT_FAILED_CONVENT_FORMATTER,
  TEXT_INVALID_VALUE,
  TEXT_UNPRINTABLE_CHARACTERS,
} from 'uiSrc/constants'
import {
  bufferToSerializedFormat,
  bufferToString,
  createTooltipContent,
  formattingBuffer,
  isEqualBuffers,
  isFormatEditable,
  isNonUnicodeFormatter,
  stringToBuffer,
  stringToSerializedBufferFormat,
} from 'uiSrc/utils'
import { decompressingBuffer } from 'uiSrc/utils/decompressors'
import {
  EditableTextArea,
  FormattedValue,
} from 'uiSrc/pages/browser/modules/key-details/shared'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { ExtendIcon } from 'uiSrc/components/base/icons'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import {
  BrowserConfirmationCommandId,
  useProductionWriteConfirmation,
} from 'uiSrc/components/production-write-confirmation'

import { ArrayValueCellProps } from './ArrayValueCell.types'
import * as S from './ArrayValueCell.styles'
import { ArrayValueEditorModal } from './ArrayValueEditorModal'

const TEST_ID_PREFIX = 'array-details-table'

/**
 * Renders a populated slot's value (formatted) wrapped in an inline editor for
 * in-place edits (ARSET). Empty slots render a muted "Empty" marker and are
 * not editable — filling a gap changes ARCOUNT/ARLEN and belongs to append /
 * set-at-index, not the value edit.
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
  // Hooks must run unconditionally on every render (rules-of-hooks) — the
  // same row component instance can transition from an empty to a populated
  // slot (e.g. after an append) while keeping the same `index` key, so these
  // are declared before the early return below rather than after it.
  const { requestConfirmation } = useProductionWriteConfirmation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  // Seeded lazily on open so we don't serialize every row's buffer on render.
  const [modalSeed, setModalSeed] = useState('')

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
  const { value: decompressed, isCompressed } = decompressingBuffer(
    buffer,
    compressor,
  )
  const decompressedBuffer = decompressed as RedisResponseBuffer
  const { value: formatted, isValid } = formattingBuffer(
    decompressedBuffer,
    viewFormat,
    { expanded: false },
  )
  const tooltipContent = createTooltipContent(
    formatted,
    decompressedBuffer,
    viewFormat,
  )

  // Compressed payloads and non-round-trippable formats can't be safely
  // edited; values with unprintable characters are disabled in the editor.
  const isEditable = !isCompressed && isFormatEditable(viewFormat)
  const isUnprintable =
    !isNonUnicodeFormatter(viewFormat, isValid) &&
    !isEqualBuffers(decompressedBuffer, stringToBuffer(bufferToString(buffer)))
  const editToolTipContent = isCompressed
    ? TEXT_DISABLED_COMPRESSED_VALUE
    : TEXT_DISABLED_FORMATTER_EDITING
  const serializedValue = isEditing
    ? bufferToSerializedFormat(viewFormat, decompressedBuffer, 4)
    : ''

  const openModal = () => {
    setModalSeed(bufferToSerializedFormat(viewFormat, decompressedBuffer, 4))
    setIsModalOpen(true)
  }

  const handleModalSave = (editedValue: string) => {
    requestConfirmation({
      title: 'Edit value on production database?',
      actionDescription:
        'You are about to modify a value on a production database.',
      confirmButtonText: 'Save',
      commandId: BrowserConfirmationCommandId.EditValue,
      disableConfirmationInput: true,
      onConfirm: () => {
        onApply?.(editedValue)
        setIsModalOpen(false)
      },
    })
  }

  return (
    <>
      <EditableTextArea
        initialValue={serializedValue}
        isEditing={isEditing}
        // Lock the open editor's Save while a write OR a patched-view read is in
        // flight: `isEditDisabled` only gates opening an edit (ignored once
        // editing), so a read that began just before the refresh-disabled flag
        // took effect could otherwise be Saved into and overwrite the patch.
        isLoading={updating || loading}
        isDisabled={isUnprintable}
        isEditDisabled={!isEditable || updating || loading}
        disabledTooltipText={TEXT_UNPRINTABLE_CHARACTERS}
        approveText={TEXT_INVALID_VALUE}
        approveByValidation={(editedValue) =>
          !!formattingBuffer(
            stringToSerializedBufferFormat(viewFormat, editedValue),
            viewFormat,
          )?.isValid
        }
        editToolTipContent={!isEditable ? editToolTipContent : null}
        secondaryAction={
          <IconButton
            icon={ExtendIcon}
            aria-label="Expand value editor"
            disabled={!isEditable || updating || loading}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              openModal()
            }}
            data-testid={`${TEST_ID_PREFIX}_expand-btn-${index}`}
          />
        }
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
            title={
              isValid ? 'Value' : TEXT_FAILED_CONVENT_FORMATTER(viewFormat)
            }
            tooltipContent={tooltipContent}
            position="bottom"
          />
        </div>
      </EditableTextArea>
      <ArrayValueEditorModal
        isOpen={isModalOpen}
        index={index}
        initialValue={modalSeed}
        onSave={handleModalSave}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
