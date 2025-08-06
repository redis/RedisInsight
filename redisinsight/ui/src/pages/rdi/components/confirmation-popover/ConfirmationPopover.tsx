import React, { useState } from 'react'

import { RiOutsideClickDetector } from 'uiBase/utils'

import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiSpacer } from 'uiBase/layout/spacer'
import { RiText } from 'uiBase/text'
import { RiPopover } from 'uiBase/index'
import { RiIcon } from 'uiBase/icons'
import { formatLongName } from 'uiSrc/utils'
import styles from './styles.module.scss'

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
    <RiOutsideClickDetector onOutsideClick={handleClosePopover}>
      <RiPopover
        id="confirmation-popover"
        ownFocus
        anchorPosition="downCenter"
        isOpen={isPopoverOpen}
        closePopover={handleClosePopover}
        panelPaddingSize="m"
        panelClassName={styles.panelPopover}
        button={popoverButton}
      >
        <RiRow align="center">
          <RiFlexItem>
            <RiIcon type="ToastDangerIcon" className={styles.alertIcon} />
          </RiFlexItem>
          <RiFlexItem className="eui-textNoWrap">
            <RiText>{formatLongName(title, 58, 0, '...')}</RiText>
          </RiFlexItem>
        </RiRow>
        <RiSpacer size="xs" />
        {body}
        <RiSpacer size="m" />
        <RiRow justify={appendAction ? 'between' : 'end'} align="center">
          <RiFlexItem>{!!appendAction && appendAction}</RiFlexItem>
          <RiFlexItem>{confirmBtn}</RiFlexItem>
        </RiRow>
      </RiPopover>
    </RiOutsideClickDetector>
  )
}

export default ConfirmationPopover
