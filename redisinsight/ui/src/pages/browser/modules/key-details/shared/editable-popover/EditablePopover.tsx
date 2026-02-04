import React, { FormEvent, useEffect, useState } from 'react'

import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  IconButton,
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { EditIcon } from 'uiSrc/components/base/icons'
import { RiPopover } from 'uiSrc/components/base'
import * as S from './EditablePopover.styles'

export interface Props {
  content: React.ReactElement
  children: React.ReactElement
  className?: string
  editBtnClassName?: string
  isOpen?: boolean
  onOpen: () => void
  onApply: () => void
  onDecline?: () => void
  isLoading?: boolean
  isDisabled?: boolean
  declineOnUnmount?: boolean
  field?: string
  prefix?: string
  btnIconType?: string
  delay?: number
  isDisabledEditButton?: boolean
}

const EditablePopover = (props: Props) => {
  const {
    content,
    isOpen = false,
    onOpen,
    onDecline,
    onApply,
    children,
    isLoading,
    declineOnUnmount = true,
    isDisabled,
    field = '',
    prefix = '',
    btnIconType,
    className,
    editBtnClassName = '',
    isDisabledEditButton,
    delay,
  } = props
  const [isHovering, setIsHovering] = useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(isOpen)
  const [isDelayed, setIsDelayed] = useState(false)

  const delayPopover = () => {
    if (!delay) return

    setIsDelayed(() => {
      setTimeout(() => setIsDelayed(false), delay)
      return true
    })
  }

  useEffect(
    () =>
      // componentWillUnmount
      () => {
        declineOnUnmount && handleDecline()
      },
    [],
  )

  useEffect(() => {
    if (isOpen) delayPopover()
    setIsPopoverOpen(isOpen)
  }, [isOpen])

  const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleApply()
  }

  const handleApply = (): void => {
    setIsPopoverOpen(false)
    onApply()
  }

  const handleDecline = () => {
    setIsPopoverOpen(false)
    onDecline?.()
  }

  const handleButtonClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.stopPropagation()
    onOpen?.()
    delayPopover()
    setIsPopoverOpen(true)
  }

  const isDisabledApply = (): boolean => !!(isLoading || isDisabled)

  const button = (
    <IconButton
      disabled={isPopoverOpen || isDisabledEditButton}
      icon={btnIconType || EditIcon}
      aria-label="Edit field"
      color="primary"
      onClick={isDisabledEditButton ? () => {} : handleButtonClick}
      className={editBtnClassName}
      data-testid={`${prefix}_edit-btn-${field}`}
    />
  )

  return (
    <S.PopoverStyles $isDelayed={isDelayed}>
      <RiPopover
        ownFocus
        anchorPosition="downLeft"
        isOpen={isPopoverOpen}
        anchorClassName={className}
        panelClassName={S.popoverWrapperClassName}
        closePopover={handleDecline}
        button={
          <Row
            align="center"
            onMouseEnter={() => setIsHovering(!isDisabledEditButton)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={(e) => e.stopPropagation()}
            data-testid={`${prefix}_content-value-${field}`}
          >
            {content}
            <FlexItem style={{ marginLeft: '-19px' }}>
              {isDelayed && <S.Spinner className={editBtnClassName} size="m" />}
              {(isPopoverOpen || isHovering) && !isDelayed && button}
            </FlexItem>
          </Row>
        }
        data-testid="popover-item-editor"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={onFormSubmit}>
          <Col gap="l">
            <Row>{children}</Row>
            <Row justify="end" gap="m">
              <FlexItem>
                <SecondaryButton
                  size="s"
                  onClick={() => handleDecline()}
                  data-testid="cancel-btn"
                >
                  Cancel
                </SecondaryButton>
              </FlexItem>
              <FlexItem>
                <PrimaryButton
                  size="s"
                  type="submit"
                  disabled={isDisabledApply()}
                  data-testid="save-btn"
                >
                  Save
                </PrimaryButton>
              </FlexItem>
            </Row>
          </Col>
        </form>
      </RiPopover>
    </S.PopoverStyles>
  )
}

export default EditablePopover
