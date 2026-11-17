import React from 'react'

import ConfirmationPopover from 'uiSrc/components/confirmation-popover'
import { Row } from 'uiSrc/components/base/layout/flex'
import {
  EmptyButton,
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { KeyValueFormat } from 'uiSrc/constants'

const getMessage = (format: KeyValueFormat) =>
  `This value is shown using the ${format} format. Saving your changes may ` +
  'store a reformatted value and alter the original data. Switch to Unicode ' +
  'to edit the raw value safely.'

export interface NonUnicodeEditConfirmationProps {
  /** The edit trigger the popover anchors to. */
  button: React.ReactNode
  isOpen: boolean
  format: KeyValueFormat
  /** Class applied to the popover's anchor, to preserve the trigger's layout. */
  anchorClassName?: string
  onCancel: () => void
  onChangeToUnicode: () => void
  onEditAnyway: () => void
}

/**
 * Warns before editing a value under a non-Unicode format, which can
 * silently reformat the stored value on save.
 */
export const NonUnicodeEditConfirmation = ({
  button,
  isOpen,
  format,
  anchorClassName,
  onCancel,
  onChangeToUnicode,
  onEditAnyway,
}: NonUnicodeEditConfirmationProps) => (
  <ConfirmationPopover
    anchorPosition="leftCenter"
    ownFocus
    isOpen={isOpen}
    closePopover={onCancel}
    panelPaddingSize="m"
    anchorClassName={anchorClassName}
    button={button}
    onClick={(e) => e.stopPropagation()}
    title="Editing a non-Unicode value"
    message={getMessage(format)}
    confirmButton={
      <Row gap="m" justify="end">
        <EmptyButton
          size="small"
          onClick={onCancel}
          data-testid="non-unicode-edit-cancel"
        >
          Cancel
        </EmptyButton>
        <SecondaryButton
          size="small"
          onClick={onEditAnyway}
          data-testid="non-unicode-edit-anyway"
        >
          Edit anyway
        </SecondaryButton>
        <PrimaryButton
          size="small"
          onClick={onChangeToUnicode}
          data-testid="non-unicode-edit-to-unicode"
        >
          Change to Unicode
        </PrimaryButton>
      </Row>
    }
  />
)
