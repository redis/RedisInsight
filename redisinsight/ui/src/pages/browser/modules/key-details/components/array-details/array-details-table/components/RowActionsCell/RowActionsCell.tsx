import React from 'react'

import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'

import { RowActionsCellProps } from './RowActionsCell.types'

export const RowActionsCell = ({
  element,
  deleteConfig,
}: RowActionsCellProps) => {
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

  return (
    <PopoverDelete
      header="Delete element"
      text="This element will be permanently removed from the array."
      item={index}
      suffix={suffix}
      deleting={deleting}
      closePopover={closePopover}
      showPopover={showPopover}
      updateLoading={false}
      handleDeleteItem={() => handleDeleteElement(index)}
      testid={`array-remove-btn-${index}`}
    />
  )
}
