import React, { useState } from 'react'

import { useTranslation } from 'uiSrc/i18n'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import { RiTooltip } from 'uiSrc/components'
import { EditIcon, ExtendIcon } from 'uiSrc/components/base/icons'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import {
  BrowserConfirmationCommandId,
  useProductionWriteConfirmation,
} from 'uiSrc/components/production-write-confirmation'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

import { getArrayElementEditState } from '../../getArrayElementEditState'
import { ArrayValueEditorModal } from '../ArrayValueEditorModal'
import { RowActionsCellProps } from './RowActionsCell.types'
import * as S from './RowActionsCell.styles'

/**
 * Right-column row actions: edit (opens the inline editor), expand (opens the
 * Monaco popup) and delete, grouped together and revealed on row hover. The
 * edit/expand triggers live here rather than over the value so long values
 * aren't hidden behind icons. Editing is driven through the table-level
 * `editingIndex` (via `editConfig`); the expand popup saves via the same
 * ARSET path, behind the production-write confirmation.
 */
export const RowActionsCell = ({
  element,
  editConfig,
  deleteConfig,
}: RowActionsCellProps) => {
  const { t } = useTranslation()
  const { requestConfirmation } = useProductionWriteConfirmation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  // Seeded lazily on open so we don't serialize every row's buffer on render.
  const [modalSeed, setModalSeed] = useState('')

  const { index, value } = element

  // In the gap-preserving View range a null value is an empty slot with
  // nothing to act on (ARDEL returns affected: 0). Search results never carry
  // gaps — an index-only match (WITHVALUES off) has a null value but is a real
  // element — so the consumer disables this guard there.
  if (deleteConfig?.hideEmptySlots && value == null) return null

  // Edit/expand only apply to a populated slot with editing wired.
  const editState =
    editConfig && value != null
      ? getArrayElementEditState(
          value as RedisResponseBuffer,
          editConfig.compressor,
          editConfig.viewFormat,
        )
      : null
  const isEditingThisRow = editConfig?.editingIndex === index
  // While this row is being edited the inline editor (with its own controls)
  // is open in the value column, so the triggers would be redundant.
  const showEditActions = !!editState && !isEditingThisRow
  const isEditActionDisabled =
    !editState?.isEditable || !!editConfig?.updating || !!editConfig?.loading

  const openModal = () => {
    if (!editState) return
    setModalSeed(editState.serialize())
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
        editConfig?.onApplyEditElement(index, editedValue)
        setIsModalOpen(false)
      },
    })
  }

  const isDeletePopoverOpen =
    !!deleteConfig && deleteConfig.deleting === `${index}${deleteConfig.suffix}`

  return (
    <S.ActionCell
      className={
        isDeletePopoverOpen
          ? 'array-row-action array-row-action--open'
          : 'array-row-action'
      }
    >
      {showEditActions && (
        <>
          <RiTooltip content={editState?.editDisabledReason ?? null}>
            <IconButton
              icon={EditIcon}
              aria-label="Edit field"
              disabled={isEditActionDisabled}
              onClick={() => editConfig?.onEditElement(index, true)}
              data-testid={`array-edit-btn-${index}`}
            />
          </RiTooltip>
          <RiTooltip content={editState?.editDisabledReason ?? null}>
            <IconButton
              icon={ExtendIcon}
              aria-label="Expand value editor"
              disabled={isEditActionDisabled}
              onClick={openModal}
              data-testid={`array-expand-btn-${index}`}
            />
          </RiTooltip>
        </>
      )}

      {deleteConfig && (
        <PopoverDelete
          header={t('browser.array.delete.row.title')}
          text={t('browser.array.delete.row.message')}
          item={index}
          suffix={deleteConfig.suffix}
          deleting={deleteConfig.deleting}
          closePopover={deleteConfig.closePopover}
          showPopover={deleteConfig.showPopover}
          updateLoading={false}
          handleDeleteItem={() => deleteConfig.handleDeleteElement(index)}
          testid={`array-remove-btn-${index}`}
        />
      )}

      {!!editState && (
        <ArrayValueEditorModal
          isOpen={isModalOpen}
          index={index}
          initialValue={modalSeed}
          onSave={handleModalSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </S.ActionCell>
  )
}
