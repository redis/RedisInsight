import React from 'react'
import {
  SecondaryButton,
  DestructiveButton,
} from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import { RiPopover } from 'uiSrc/components/base'

import { type CancelButtonProps } from './CancelButton.types'

export const CancelButton = ({
  isPopoverOpen,
  onClose,
  onShowPopover,
  onClosePopover,
}: CancelButtonProps) => (
  <RiPopover
    anchorPosition="upCenter"
    isOpen={isPopoverOpen}
    closePopover={onClosePopover}
    panelPaddingSize="l"
    maxWidth="350px"
    button={
      <SecondaryButton
        onClick={onShowPopover}
        className="btn-cancel"
        data-testid="btn-cancel"
      >
        Cancel
      </SecondaryButton>
    }
  >
    <Text size="S">
      Your changes have not been saved.&#10;&#13; Do you want to proceed to the
      list of databases?
    </Text>
    <br />
    <div>
      <DestructiveButton
        size="s"
        onClick={onClose}
        data-testid="btn-cancel-proceed"
      >
        Proceed
      </DestructiveButton>
    </div>
  </RiPopover>
)
