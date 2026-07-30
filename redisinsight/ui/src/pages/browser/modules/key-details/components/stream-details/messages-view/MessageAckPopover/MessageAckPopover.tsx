import React from 'react'

import {
  DestructiveButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { HorizontalSpacer } from 'uiSrc/components/base/layout'
import ConfirmationPopover from 'uiSrc/components/confirmation-popover'
import { useTranslation } from 'uiSrc/i18n'

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
  const { t } = useTranslation()
  return (
    <ConfirmationPopover
      key={id}
      title={id}
      message={t('browser.stream.ack.message')}
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
          {t('browser.stream.ack.confirm')}
        </DestructiveButton>
      }
      button={
        <>
          <SecondaryButton
            size="s"
            aria-label={t('browser.stream.ack.aria')}
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
