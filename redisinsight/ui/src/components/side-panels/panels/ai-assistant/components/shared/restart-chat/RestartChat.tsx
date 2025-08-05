import React, { useState } from 'react'
import cx from 'classnames'

import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import { RiPrimaryButton } from 'uiSrc/components/base/forms'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { RiPopover } from 'uiSrc/components/base'
import styles from './styles.module.scss'

export interface Props {
  button: NonNullable<React.ReactElement>
  onConfirm: () => void
  anchorClassName?: string
}

const RestartChat = (props: Props) => {
  const { button, onConfirm, anchorClassName = '' } = props
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const handleConfirm = () => {
    setIsPopoverOpen(false)
    onConfirm()
  }

  const onClickAnchor = () => {
    setIsPopoverOpen(true)
  }

  const extendedButton = React.cloneElement(button, { onClick: onClickAnchor })

  return (
    <RiPopover
      ownFocus
      panelClassName={cx('popoverLikeTooltip', styles.popover)}
      anchorClassName={cx(styles.popoverAnchor, anchorClassName)}
      anchorPosition="downLeft"
      isOpen={isPopoverOpen}
      panelPaddingSize="m"
      closePopover={() => setIsPopoverOpen(false)}
      button={extendedButton}
    >
      <>
        <Title size="S">Restart session</Title>
        <RiSpacer size="s" />
        <Text size="xs">
          This will delete the current message history and initiate a new
          session.
        </Text>
        <RiSpacer size="s" />
        <RiPrimaryButton
          size="s"
          onClick={handleConfirm}
          className={styles.confirmBtn}
          data-testid="ai-chat-restart-confirm"
        >
          Restart
        </RiPrimaryButton>
      </>
    </RiPopover>
  )
}

export default React.memo(RestartChat)
