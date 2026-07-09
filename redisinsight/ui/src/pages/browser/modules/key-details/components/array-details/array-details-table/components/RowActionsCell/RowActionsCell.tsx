import React from 'react'

import { useTranslation } from 'uiSrc/i18n'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import { RiTooltip } from 'uiSrc/components'
import { EditIcon, ExtendIcon } from 'uiSrc/components/base/icons'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

import { getArrayElementEditState } from '../../getArrayElementEditState'
import { RowActionsCellProps } from './RowActionsCell.types'
import * as S from './RowActionsCell.styles'

/**
 * Right-column row actions — edit (inline editor), expand (Monaco drawer) and
 * delete, revealed on row hover. The triggers live here, not over the value,
 * so long values aren't hidden behind icons. Editing and the drawer are both
 * driven from `ArrayDetailsTable` (via `editConfig`), so they share its
 * refresh-pause and abandon-on-tab/key guards.
 */
export const RowActionsCell = ({
  element,
  editConfig,
  deleteConfig,
}: RowActionsCellProps) => {
  const { t } = useTranslation()

  const { index, value } = element

  // In the gap-preserving View range a null value is an empty slot with
  // nothing to act on (ARDEL returns affected: 0). Search results never carry
  // gaps — an index-only match (WITHVALUES off) has a null value but is a real
  // element — so the consumer disables this guard there.
  if (deleteConfig?.hideEmptySlots && value == null) return null

  const editState =
    editConfig && value != null
      ? getArrayElementEditState(
          value as RedisResponseBuffer,
          editConfig.compressor,
          editConfig.viewFormat,
        )
      : null
  const isEditingThisRow = editConfig?.editingIndex === index
  // Hide the triggers while this row is being inline-edited (its editor already
  // has controls) and while the drawer is open on any row — otherwise a second
  // expand would silently re-seed the open drawer and drop unsaved text.
  const showEditActions =
    !!editState && !isEditingThisRow && !editConfig?.isValueDrawerOpen
  const isEditActionDisabled =
    !editState?.isEditable || !!editConfig?.updating || !!editConfig?.loading

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
              onClick={(e: React.MouseEvent) => {
                // Search renders this table with expandRowOnClick — don't let
                // the action click also toggle the neighbour band.
                e.stopPropagation()
                editConfig?.onEditElement(index, true)
              }}
              data-testid={`array-edit-btn-${index}`}
            />
          </RiTooltip>
          <RiTooltip content={editState?.editDisabledReason ?? null}>
            <IconButton
              icon={ExtendIcon}
              aria-label="Expand value editor"
              disabled={isEditActionDisabled}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                editConfig?.onOpenValueEditor(index)
              }}
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
    </S.ActionCell>
  )
}
