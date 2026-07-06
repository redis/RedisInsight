import React, { useEffect, useState } from 'react'

import { useTranslation } from 'uiSrc/i18n'
import ConfirmationPopover from 'uiSrc/components/confirmation-popover'
import { DeleteIcon } from 'uiSrc/components/base/icons'
import { DestructiveButton } from 'uiSrc/components/base/forms/buttons'

import { BulkDeleteHeaderCellProps } from './BulkDeleteHeaderCell.types'
import * as S from './BulkDeleteHeaderCell.styles'

/**
 * Danger bulk-delete trigger rendered in the actions-column header. A filled
 * red rounded button with a white trash, shown only while rows are selected;
 * the confirm popover states how many will go, so no always-on count is
 * needed. Clearing or deleting the selection removes the trigger, so nothing
 * shifts the table layout.
 */
export const BulkDeleteHeaderCell = ({
  bulkDeleteConfig,
}: BulkDeleteHeaderCellProps) => {
  const { t } = useTranslation()
  const { selectedCount, handleBulkDelete } = bulkDeleteConfig
  const [isOpen, setIsOpen] = useState(false)

  // The header cell stays mounted, so drop any open confirm popover when the
  // selection clears; otherwise the next selection would show it stale-open.
  useEffect(() => {
    if (selectedCount === 0) setIsOpen(false)
  }, [selectedCount])

  if (selectedCount === 0) return null

  return (
    <S.DangerAction>
      <ConfirmationPopover
        anchorPosition="leftCenter"
        ownFocus
        isOpen={isOpen}
        closePopover={() => setIsOpen(false)}
        panelPaddingSize="m"
        title={t('browser.array.delete.bulk.title')}
        message={t('browser.array.delete.bulk.message', {
          count: selectedCount,
        })}
        button={
          <S.TriggerButton
            icon={DeleteIcon}
            size="small"
            aria-label={t('browser.array.delete.bulk.aria')}
            onClick={() => setIsOpen((open) => !open)}
            data-testid="array-bulk-remove-btn-icon"
          />
        }
        confirmButton={
          <DestructiveButton
            size="small"
            icon={DeleteIcon}
            onClick={() => {
              handleBulkDelete()
              setIsOpen(false)
            }}
            data-testid="array-bulk-remove-btn"
          >
            {t('browser.array.delete.bulk.button')}
          </DestructiveButton>
        }
      />
    </S.DangerAction>
  )
}
