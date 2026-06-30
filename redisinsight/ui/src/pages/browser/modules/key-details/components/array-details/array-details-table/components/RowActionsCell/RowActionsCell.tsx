import React from 'react'

import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'

import { RowActionsCellProps } from './RowActionsCell.types'

export const RowActionsCell = ({
  element,
  deleteConfig,
}: RowActionsCellProps) => {
  // Empty slots have nothing to delete — ARDEL on a gap returns affected: 0.
  if (element.value == null) return null

  const { deleting, suffix, closePopover, showPopover, handleDeleteElement } =
    deleteConfig
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
