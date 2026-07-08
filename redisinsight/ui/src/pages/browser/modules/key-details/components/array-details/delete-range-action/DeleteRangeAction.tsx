import React, { useEffect, useState } from 'react'

import { useTranslation } from 'uiSrc/i18n'
import ConfirmationPopover from 'uiSrc/components/confirmation-popover'
import { DestructiveButton } from 'uiSrc/components/base/forms/buttons'
import { DeleteIcon } from 'uiSrc/components/base/icons'
import { parseArrayIndex } from 'uiSrc/utils/arrayIndex'

import { DeleteRangeActionProps } from './DeleteRangeAction.types'

export const DELETE_RANGE_ACTION_TEST_ID = 'array-delete-range'

/**
 * Destructive "Delete range" action for the array View tab, shown in the
 * subheader next to "Add Elements". Deletes the inclusive [start, end] window
 * from the range inputs (ARDELRANGE) behind a confirm popover.
 *
 * Not span-capped, unlike the view query — the delete endpoint accepts any
 * window, so deleting a huge range without loading it first is supported.
 */
export const DeleteRangeAction = ({
  keyName,
  start,
  end,
  loading = false,
  disabled = false,
  onDeleteRange,
}: DeleteRangeActionProps) => {
  const { t } = useTranslation()
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Don't carry an open confirm across a key switch: the inputs reset for the
  // new key, so confirming would delete a stale window from it.
  useEffect(() => {
    setConfirmOpen(false)
  }, [keyName, disabled])

  // Only canonical decimal strings, matching the backend's @IsArrayIndex.
  const startInvalid = parseArrayIndex(start) !== start
  const endInvalid = parseArrayIndex(end) !== end
  const deleteDisabled = startInvalid || endInvalid || loading || disabled

  return (
    <ConfirmationPopover
      anchorPosition="downCenter"
      ownFocus
      isOpen={confirmOpen}
      closePopover={() => setConfirmOpen(false)}
      panelPaddingSize="m"
      title={t('browser.array.delete.range.title')}
      message={t('browser.array.delete.range.message', { start, end })}
      button={
        <DestructiveButton
          size="small"
          icon={DeleteIcon}
          onClick={() => setConfirmOpen((open) => !open)}
          disabled={deleteDisabled}
          data-testid={DELETE_RANGE_ACTION_TEST_ID}
        >
          {t('browser.array.delete.range.trigger')}
        </DestructiveButton>
      }
      confirmButton={
        <DestructiveButton
          size="small"
          icon={DeleteIcon}
          disabled={deleteDisabled}
          onClick={() => {
            onDeleteRange()
            setConfirmOpen(false)
          }}
          data-testid={`${DELETE_RANGE_ACTION_TEST_ID}-confirm`}
        >
          {t('browser.array.delete.range.button')}
        </DestructiveButton>
      }
    />
  )
}
