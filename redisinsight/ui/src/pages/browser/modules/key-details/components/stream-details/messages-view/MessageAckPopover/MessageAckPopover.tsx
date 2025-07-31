import React from 'react'

import { Text } from 'uiSrc/components/base/text'
import {
  DestructiveButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { RiPopover } from 'uiSrc/components/base'
import { HorizontalSpacer } from 'uiSrc/components/base/layout'
import styles from './styles.module.scss'

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
    <RiPopover
      key={id}
      anchorPosition="leftCenter"
      ownFocus
      isOpen={isOpen}
      closePopover={closePopover}
      panelPaddingSize="m"
      anchorClassName="ackMessagePopover"
      panelClassName={styles.popoverWrapper}
      button={
        <>
          <SecondaryButton
            size="s"
            aria-label="Acknowledge pending message"
            onClick={showPopover}
            className={styles.ackBtn}
            data-testid="acknowledge-btn"
          >
            ACK
          </SecondaryButton>
          <HorizontalSpacer size="s" />
        </>
      }
    >
      <div className={styles.popover}>
        <Text size="m">
          <b>{id}</b>
          <br />
          will be acknowledged and removed from the pending messages list
        </Text>
        <div className={styles.popoverFooter}>
          <DestructiveButton
            size="s"
            onClick={() => acknowledge(id)}
            data-testid="acknowledge-submit"
          >
            Acknowledge
          </DestructiveButton>
        </div>
      </div>
    </RiPopover>
  )
}

export default AckPopover
