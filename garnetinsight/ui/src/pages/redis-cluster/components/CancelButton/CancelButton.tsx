import React from 'react'

import { RiPopover } from 'uiSrc/components/base'
import { DestructiveButton, SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import styles from './CancelButton.style'

import type { CancelButtonProps } from './CancelButton.types'

export const CancelButton = ({
  isPopoverOpen,
  onShowPopover,
  onClosePopover,
  onProceed,
}: CancelButtonProps) => (
  <RiPopover
    anchorPosition="upCenter"
    isOpen={isPopoverOpen}
    closePopover={onClosePopover}
    panelClassName={styles.panelCancelBtn}
    panelPaddingSize="l"
    button={
      <SecondaryButton
        onClick={onShowPopover}
        className="btn-cancel"
        data-testid="btn-back"
      >
        Cancel
      </SecondaryButton>
    }
  >
    <Text size="m">
      Your changes have not been saved.&#10;&#13; Do you want to proceed to
      the list of databases?
    </Text>
    <br />
    <div>
      <DestructiveButton
        size="s"
        onClick={onProceed}
        data-testid="btn-back-proceed"
      >
        Proceed
      </DestructiveButton>
    </div>
  </RiPopover>
)

