import React from 'react'

import {
  DestructiveButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { HorizontalSpacer } from 'uiSrc/components/base/layout'
import ConfirmationPopover from 'uiSrc/components/confirmation-popover'

export interface Props {
  id: string
  isOpen: boolean
  closePopover: () => void
  showPopover: () => void
  acknowledge: (entry: string) => void
}

const AckPopover = (props: Props) => {
  const {
    id,
    isOpen,
    closePopover = () => {},
    showPopover = () => {},
    acknowledge = () => {},
  } = props
  return (
    <ConfirmationPopover
      key={id}
      title={id}
      message="will be acknowledged and removed from the pending messages list"
      anchorPosition="leftCenter"
      ownFocus
      isOpen={isOpen}
      closePopover={closePopover}
      panelPaddingSize="m"
      anchorClassName="ackMessagePopover"
      confirmButton={
        <DestructiveButton
          size="s"
          onClick={() => acknowledge(id)}
          data-testid="acknowledge-submit"
        >
          Acknowledge
        </DestructiveButton>
      }
      button={
        <>
          <SecondaryButton
            size="s"
            aria-label="Acknowledge pending message"
            onClick={showPopover}
            data-testid="acknowledge-btn"
          >
            ACK
          </SecondaryButton>
          <HorizontalSpacer size="s" />
        </>
      }
    />
  )
}

export default AckPopover
