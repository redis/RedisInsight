import React, { useState } from 'react'

import { formatLongName } from 'uiSrc/utils'
import { OutsideClickDetector } from 'uiSrc/components/base/utils'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Text } from 'uiSrc/components/base/text'
import { RiPopover } from 'uiSrc/components/base'
import * as S from './ConfirmationPopover.styles'

interface Props {
  title: string
  body: JSX.Element
  onConfirm: () => void
  button: JSX.Element
  submitBtn: JSX.Element
  onButtonClick?: () => void
  appendAction?: JSX.Element
}

const ConfirmationPopover = (props: Props) => {
  const {
    title,
    body,
    submitBtn,
    onConfirm,
    button,
    onButtonClick,
    appendAction,
  } = props
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false)

  const handleClosePopover = () => {
    setIsPopoverOpen(false)
  }

  const handleConfirm = () => {
    onConfirm()
    setIsPopoverOpen(false)
  }

  const handleButtonClick = () => {
    setIsPopoverOpen(true)
    onButtonClick?.()
  }

  const popoverButton = React.cloneElement(button, {
    onClick: handleButtonClick,
  })
  const confirmBtn = React.cloneElement(submitBtn, { onClick: handleConfirm })

  return (
    <OutsideClickDetector onOutsideClick={handleClosePopover}>
      <RiPopover
        id="confirmation-popover"
        ownFocus
        anchorPosition="downCenter"
        isOpen={isPopoverOpen}
        closePopover={handleClosePopover}
        panelPaddingSize="m"
        maxWidth={S.POPOVER_WIDTH}
        button={popoverButton}
      >
        <Row align="center">
          <FlexItem>
            <S.AlertIcon />
          </FlexItem>
          <FlexItem className="eui-textNoWrap">
            <Text>{formatLongName(title, 58, 0, '...')}</Text>
          </FlexItem>
        </Row>
        <Spacer size="xs" />
        {body}
        <Spacer size="m" />
        <Row justify={appendAction ? 'between' : 'end'} align="center">
          <FlexItem>{!!appendAction && appendAction}</FlexItem>
          <FlexItem>{confirmBtn}</FlexItem>
        </Row>
      </RiPopover>
    </OutsideClickDetector>
  )
}

export default ConfirmationPopover
