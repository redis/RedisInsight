import React from 'react'

import { RiText } from 'uiSrc/components/base/text'
import {
  RiDestructiveButton,
  RiSecondaryButton,
} from 'uiSrc/components/base/forms'
import { RiPopover } from 'uiSrc/components/base'
import { RiHorizontalSpacer } from 'uiSrc/components/base/layout'
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
          <RiSecondaryButton
            size="s"
            aria-label="Acknowledge pending message"
            onClick={showPopover}
            className={styles.ackBtn}
            data-testid="acknowledge-btn"
          >
            ACK
          </RiSecondaryButton>
          <RiHorizontalSpacer size="s" />
        </>
      }
    >
      <div className={styles.popover}>
        <RiText size="m">
          <b>{id}</b>
          <br />
          will be acknowledged and removed from the pending messages list
        </RiText>
        <div className={styles.popoverFooter}>
          <RiDestructiveButton
            size="s"
            onClick={() => acknowledge(id)}
            data-testid="acknowledge-submit"
          >
            Acknowledge
          </RiDestructiveButton>
        </div>
      </div>
    </RiPopover>
  )
}

export default AckPopover
