import React, { useState } from 'react'

import { RiDestructiveButton } from 'uiBase/forms'
import { DeleteIcon, RiIcon } from 'uiBase/icons'
import { RiText } from 'uiBase/text'
import { RiPopover } from 'uiBase/index'
import { formatLongName } from 'uiSrc/utils'
import styles from './styles.module.scss'

export interface Props {
  id: string
  label: string
  isLoading?: boolean
  onDelete: (e: React.MouseEvent) => void
}

const DeleteTutorialButton = (props: Props) => {
  const { id, label, onDelete, isLoading } = props
  const [isPopoverDeleteOpen, setIsPopoverDeleteOpen] = useState<boolean>(false)

  const handleClickDelete = () => {
    setIsPopoverDeleteOpen((v) => !v)
  }

  return (
    <RiPopover
      anchorPosition="rightCenter"
      ownFocus
      isOpen={isPopoverDeleteOpen}
      closePopover={() => setIsPopoverDeleteOpen(false)}
      panelPaddingSize="l"
      button={
        <div
          className="group-header__btn group-header__delete-btn"
          role="presentation"
          onClick={handleClickDelete}
          data-testid={`delete-tutorial-icon-${id}`}
        >
          <RiIcon size="m" type="DeleteIcon" />
        </div>
      }
      onClick={(e) => e.stopPropagation()}
      data-testid={`delete-tutorial-popover-${id}`}
    >
      <div className={styles.popoverDeleteContainer}>
        <RiText size="m" component="div">
          <h4 style={{ wordBreak: 'break-all' }}>
            <b>{formatLongName(label)}</b>
          </h4>
          <RiText size="s">will be deleted.</RiText>
        </RiText>
        <div className={styles.popoverFooter}>
          <RiDestructiveButton
            size="s"
            icon={DeleteIcon}
            onClick={onDelete}
            loading={isLoading}
            data-testid={`delete-tutorial-${id}`}
          >
            Delete
          </RiDestructiveButton>
        </div>
      </div>
    </RiPopover>
  )
}

export default DeleteTutorialButton
