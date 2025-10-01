import React, { FormEvent, useEffect, useState } from 'react'
import cx from 'classnames'

import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  IconButton,
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { EditIcon } from 'uiSrc/components/base/icons'
import { Loader } from 'uiSrc/components/base/display'
import { RiPopover } from 'uiSrc/components/base'
import styles from './styles.module.scss'

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
    <RiPopover
      ownFocus
      anchorPosition="downLeft"
      isOpen={isPopoverOpen}
      anchorClassName={className}
      panelClassName={cx(styles.popoverWrapper, {
        [styles.isDelayed]: isDelayed,
      })}
      closePopover={handleDecline}
      button={
        <Row
          align="center"
          className={styles.contentWrapper}
          onMouseEnter={() => setIsHovering(!isDisabledEditButton)}
          onMouseLeave={() => setIsHovering(false)}
          data-testid={`${prefix}_content-value-${field}`}
        >
          {content}
          {isDelayed && (
            <Loader className={cx(editBtnClassName, styles.spinner)} size="m" />
          )}
          <FlexItem>
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
  )
}

export default EditablePopover
