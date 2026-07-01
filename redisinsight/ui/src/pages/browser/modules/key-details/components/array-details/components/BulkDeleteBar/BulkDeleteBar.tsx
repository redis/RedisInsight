import React, { useEffect, useState } from 'react'

import { Text } from 'uiSrc/components/base/text'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'

import { BulkDeleteBarProps } from './BulkDeleteBar.types'
import * as S from './BulkDeleteBar.styles'

const BULK_ITEM = 'bulk'
const BULK_SUFFIX = '-array-bulk'

/**
 * Contextual action bar shown above the array table once rows are selected:
 * the count plus a confirm-gated bulk delete and a clear action. Renders
 * nothing when the selection is empty.
 */
export const BulkDeleteBar = ({
  selectedCount,
  onBulkDelete,
  onClear,
}: BulkDeleteBarProps) => {
  const [deleting, setDeleting] = useState('')

  // The bar renders nothing while empty but stays mounted, so drop any open
  // confirm popover when the selection clears (a new range/search, or Clear).
  // Otherwise the next selection would remount with a stale-open dialog.
  useEffect(() => {
    if (selectedCount === 0) setDeleting('')
  }, [selectedCount])

  if (selectedCount === 0) return null

  const plural = selectedCount === 1 ? '' : 's'

  return (
    <S.BarRow
      align="center"
      gap="m"
      grow={false}
      data-testid="array-bulk-delete-bar"
    >
      <Text>{selectedCount} selected</Text>
      <PopoverDelete
        header="Delete elements"
        text={`${selectedCount} selected element${plural} will be permanently removed from the array.`}
        item={BULK_ITEM}
        suffix={BULK_SUFFIX}
        deleting={deleting}
        showPopover={(item) => setDeleting(`${item}${BULK_SUFFIX}`)}
        closePopover={() => setDeleting('')}
        updateLoading={false}
        handleDeleteItem={() => {
          onBulkDelete()
          setDeleting('')
        }}
        buttonLabel="Delete"
        testid="array-bulk-remove-btn"
      />
      <EmptyButton onClick={onClear} data-testid="array-bulk-clear-btn">
        Clear
      </EmptyButton>
    </S.BarRow>
  )
}
