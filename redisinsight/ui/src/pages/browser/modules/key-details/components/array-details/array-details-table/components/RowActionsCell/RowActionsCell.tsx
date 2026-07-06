import React from 'react'

import { useTranslation } from 'uiSrc/i18n'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'

import { RowActionsCellProps } from './RowActionsCell.types'
import * as S from './RowActionsCell.styles'

export const RowActionsCell = ({
  element,
  deleteConfig,
}: RowActionsCellProps) => {
  const { t } = useTranslation()
  const {
    deleting,
    suffix,
    hideEmptySlots,
    closePopover,
    showPopover,
    handleDeleteElement,
  } = deleteConfig

  // In the gap-preserving View range a null value is an empty slot with
  // nothing to delete (ARDEL returns affected: 0). Search results never carry
  // gaps — an index-only match (WITHVALUES off) has a null value but is a real
  // element — so the consumer disables this guard there.
  if (hideEmptySlots && element.value == null) return null

  const { index } = element
  const isOpen = deleting === `${index}${suffix}`

  return (
    <S.ActionCell
      className={
        isOpen ? 'array-row-action array-row-action--open' : 'array-row-action'
      }
    >
      <PopoverDelete
        header={t('browser.array.delete.row.title')}
        text={t('browser.array.delete.row.message')}
        item={index}
        suffix={suffix}
        deleting={deleting}
        closePopover={closePopover}
        showPopover={showPopover}
        updateLoading={false}
        handleDeleteItem={() => handleDeleteElement(index)}
        testid={`array-remove-btn-${index}`}
      />
    </S.ActionCell>
  )
}
