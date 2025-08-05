import React from 'react'

import { RiPopover, RiTooltip } from 'uiSrc/components/base'
import { DeleteIcon } from 'uiSrc/components/base/icons'
import { RedisString } from 'uiSrc/slices/interfaces'
import { isTruncatedString } from 'uiSrc/utils'
import { TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA } from 'uiSrc/constants'
import {
  RiDestructiveButton,
  RiEmptyButton,
  RiIconButton,
} from 'uiSrc/components/base/forms'
import { Text } from 'uiSrc/components/base/text'
import styles from './styles.module.scss'

export interface Props {
  header?: JSX.Element | string
  text: JSX.Element | string
  item: string
  itemRaw?: RedisString
  suffix?: string
  deleting: string
  closePopover: () => void
  showPopover: (item: string) => void
  updateLoading: boolean
  handleDeleteItem: (item: RedisString | string) => void
  handleButtonClick?: () => void
  appendInfo?: JSX.Element | string | null
  testid?: string
  buttonLabel?: string
}

const PopoverDelete = (props: Props) => {
  const {
    header,
    text,
    item,
    itemRaw,
    suffix = '',
    deleting,
    closePopover,
    updateLoading,
    showPopover,
    handleDeleteItem,
    handleButtonClick,
    appendInfo,
    testid = '',
    buttonLabel,
  } = props

  const isDisabled = isTruncatedString(item)

  const onButtonClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.stopPropagation()
    if (item + suffix !== deleting) {
      showPopover(item)
      handleButtonClick?.()
    } else {
      closePopover()
    }
  }

  const deleteButton = buttonLabel ? (
    <RiEmptyButton
      icon={DeleteIcon}
      aria-label="Remove field"
      disabled={isDisabled || updateLoading}
      onClick={isDisabled ? () => {} : onButtonClick}
      data-testid={testid ? `${testid}-icon` : 'remove-icon'}
    >
      {buttonLabel}
    </RiEmptyButton>
  ) : (
    <RiIconButton
      size="M"
      icon={DeleteIcon}
      aria-label="Remove field"
      disabled={isDisabled || updateLoading}
      onClick={isDisabled ? () => {} : onButtonClick}
      data-testid={testid ? `${testid}-icon` : 'remove-icon'}
    />
  )

  const deleteButtonWithTooltip = (
    <RiTooltip
      content={TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA}
      anchorClassName={styles.editBtnAnchor}
      data-testid={testid ? `${testid}-tooltip` : 'remove-tooltip'}
    >
      {deleteButton}
    </RiTooltip>
  )

  return (
    <RiPopover
      key={item}
      anchorPosition="leftCenter"
      ownFocus
      isOpen={item + suffix === deleting}
      closePopover={() => closePopover()}
      panelPaddingSize="m"
      anchorClassName="deleteFieldPopover"
      button={isDisabled ? deleteButtonWithTooltip : deleteButton}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.popover}>
        <Text size="m" component="div">
          {!!header && (
            <h4>
              <b>{header}</b>
            </h4>
          )}
          <Text size="s">{text}</Text>
          {appendInfo}
        </Text>
        <div className={styles.popoverFooter}>
          <RiDestructiveButton
            icon={DeleteIcon}
            onClick={() => handleDeleteItem(itemRaw || item)}
            data-testid={testid || 'remove'}
          >
            Remove
          </RiDestructiveButton>
        </div>
      </div>
    </RiPopover>
  )
}

export default PopoverDelete
