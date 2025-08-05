import React, { useState } from 'react'
import { formatLongName } from 'uiSrc/utils'

import {
  RiDestructiveButton,
  RiPrimaryButton,
} from 'uiSrc/components/base/forms'
import { DeleteIcon, RiIcon } from 'uiSrc/components/base/icons'
import { RiFlexItem, RiRow } from 'uiSrc/components/base/layout'
import { Text } from 'uiSrc/components/base/text'
import { RiPopover } from 'uiSrc/components'
import styles from '../styles.module.scss'

export interface Props<T> {
  selection: T[]
  onDelete: () => void
  subTitle: string
}

const DeleteAction = <T extends { id: string; name?: string }>(
  props: Props<T>,
) => {
  const { selection, onDelete, subTitle } = props
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const onButtonClick = () => {
    setIsPopoverOpen((prevState) => !prevState)
  }

  const closePopover = () => {
    setIsPopoverOpen(false)
  }

  const deleteBtn = (
    <RiPrimaryButton
      size="small"
      onClick={onButtonClick}
      icon={DeleteIcon}
      className={styles.actionBtn}
      data-testid="delete-btn"
    >
      Delete
    </RiPrimaryButton>
  )

  return (
    <RiPopover
      id="deletePopover"
      ownFocus
      button={deleteBtn}
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      panelPaddingSize="l"
      data-testid="delete-popover"
    >
      <Text size="m" className={styles.popoverSubTitle}>
        {subTitle}
      </Text>
      <div className={styles.boxSection}>
        {selection.map((select) => (
          <RiRow key={select.id} gap="s" className={styles.nameList}>
            <RiFlexItem>
              <RiIcon type="CheckThinIcon" />
            </RiFlexItem>
            <RiFlexItem grow className={styles.nameListText}>
              <span>{formatLongName(select.name)}</span>
            </RiFlexItem>
          </RiRow>
        ))}
      </div>
      <div className={styles.popoverFooter}>
        <RiDestructiveButton
          size="small"
          icon={DeleteIcon}
          onClick={() => {
            closePopover()
            onDelete()
          }}
          className={styles.popoverDeleteBtn}
          data-testid="delete-selected-dbs"
        >
          Delete
        </RiDestructiveButton>
      </div>
    </RiPopover>
  )
}

export default DeleteAction
