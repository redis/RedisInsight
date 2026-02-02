import React from 'react'

import { RiTooltip } from 'uiSrc/components/base'
import { DeleteIcon } from 'uiSrc/components/base/icons'
import { RedisString } from 'uiSrc/slices/interfaces'
import { isTruncatedString } from 'uiSrc/utils'
import { TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA } from 'uiSrc/constants'
import {
  DestructiveButton,
  EmptyButton,
  IconButton,
} from 'uiSrc/components/base/forms/buttons'
import ConfirmationPopover from 'uiSrc/components/confirmation-popover'

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
  persistent?: boolean
  customOutsideDetector?: boolean
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
    persistent,
    customOutsideDetector,
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
    <EmptyButton
      icon={DeleteIcon}
      aria-label="Remove field"
      disabled={isDisabled || updateLoading}
      onClick={isDisabled ? () => {} : onButtonClick}
      data-testid={testid ? `${testid}-icon` : 'remove-icon'}
    >
      {buttonLabel}
    </EmptyButton>
  ) : (
    <IconButton
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
      data-testid={testid ? `${testid}-tooltip` : 'remove-tooltip'}
    >
      {deleteButton}
    </RiTooltip>
  )

  return (
    <ConfirmationPopover
      key={item}
      anchorPosition="leftCenter"
      ownFocus
      isOpen={item + suffix === deleting}
      closePopover={() => closePopover()}
      panelPaddingSize="m"
      anchorClassName="deleteFieldPopover"
      button={isDisabled ? deleteButtonWithTooltip : deleteButton}
      onClick={(e) => e.stopPropagation()}
      title={header}
      message={text}
      persistent={persistent}
      appendInfo={appendInfo}
      confirmButton={
        <DestructiveButton
          size="small"
          icon={DeleteIcon}
          onClick={() => handleDeleteItem(itemRaw || item)}
          data-testid={testid || 'remove'}
        >
          Remove
        </DestructiveButton>
      }
      customOutsideDetector={customOutsideDetector}
    />
  )
}

export default PopoverDelete
