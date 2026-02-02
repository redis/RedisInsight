import React, { useState } from 'react'
import cx from 'classnames'

import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { RiPopover } from 'uiSrc/components/base'
import { Row } from 'uiSrc/components/base/layout/flex'
import * as S from '../../../../../SidePanels.styles'

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
      panelClassName="popoverLikeTooltip"
      anchorClassName={cx(anchorClassName)}
      anchorPosition="downLeft"
      isOpen={isPopoverOpen}
      panelPaddingSize="m"
      closePopover={() => setIsPopoverOpen(false)}
      button={extendedButton}
      minWidth={300}
    >
      <S.RestartPopover>
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
          <S.ConfirmBtn
            as={PrimaryButton}
            size="s"
            onClick={handleConfirm}
            data-testid="ai-chat-restart-confirm"
          >
            Restart
          </S.ConfirmBtn>
        </Row>
      </S.RestartPopover>
    </RiPopover>
  )
}

export default React.memo(RestartChat)
