import React, { useState } from 'react'
import cx from 'classnames'

import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { RiPopover } from 'uiSrc/components/base'
import { Row } from 'uiSrc/components/base/layout/flex'
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
        <Title size="S" color="primary">
          Restart session
        </Title>
        <Spacer size="s" />
        <Text size="m" color="primary">
          This will delete the current message history and initiate a new
          session.
        </Text>
        <Spacer size="l" />
        <Row justify="end">
          <PrimaryButton
            size="s"
            onClick={handleConfirm}
            className={styles.confirmBtn}
            data-testid="ai-chat-restart-confirm"
          >
            Restart
          </PrimaryButton>
        </Row>
      </>
    </RiPopover>
  )
}

export default React.memo(RestartChat)
