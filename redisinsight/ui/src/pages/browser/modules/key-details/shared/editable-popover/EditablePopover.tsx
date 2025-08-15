import React, { FormEvent, useEffect, useState } from 'react'
import cx from 'classnames'

import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiSpacer } from 'uiBase/layout/spacer'
import { RiIconButton, RiPrimaryButton, RiSecondaryButton } from 'uiBase/forms'
import { EditIcon } from 'uiBase/icons'
import { RiLoader, RiPopover } from 'uiBase/display'
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
    <RiIconButton
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
        <div
          className={styles.contentWrapper}
          onMouseEnter={() => setIsHovering(!isDisabledEditButton)}
          onMouseLeave={() => setIsHovering(false)}
          data-testid={`${prefix}_content-value-${field}`}
        >
          {content}
          {isDelayed && (
            <RiLoader
              className={cx(editBtnClassName, styles.spinner)}
              size="m"
            />
          )}
          {!isPopoverOpen && isHovering && !isDelayed && button}
        </div>
      }
      data-testid="popover-item-editor"
      onClick={(e) => e.stopPropagation()}
    >
      <form onSubmit={onFormSubmit}>
        <div className={styles.content}>{children}</div>
        <RiSpacer size="s" />
        <RiRow className={styles.footer} justify="end" gap="m">
          <RiFlexItem>
            <RiSecondaryButton
              size="s"
              onClick={() => handleDecline()}
              data-testid="cancel-btn"
            >
              Cancel
            </RiSecondaryButton>
          </RiFlexItem>

          <RiFlexItem>
            <RiPrimaryButton
              size="s"
              type="submit"
              disabled={isDisabledApply()}
              data-testid="save-btn"
            >
              Save
            </RiPrimaryButton>
          </RiFlexItem>
        </RiRow>
      </form>
    </RiPopover>
  )
}

export default EditablePopover
