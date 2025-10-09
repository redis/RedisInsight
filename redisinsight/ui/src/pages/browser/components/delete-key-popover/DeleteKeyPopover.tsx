import React from 'react'

import cx from 'classnames'
import { KeyTypes, ModulesKeyTypes } from 'uiSrc/constants'
import { formatLongName } from 'uiSrc/utils'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import {
  DestructiveButton,
  IconButton,
} from 'uiSrc/components/base/forms/buttons'
import { DeleteIcon } from 'uiSrc/components/base/icons'
import ConfirmationPopover from 'uiSrc/components/confirmation-popover'

export interface DeleteProps {
  nameString: string
  name: RedisResponseBuffer
  type: KeyTypes | ModulesKeyTypes
  rowId: number
  deletePopoverId?: number
  deleting?: boolean
  onDelete: (key: RedisResponseBuffer) => void
  onOpenPopover: (index: number, type: KeyTypes | ModulesKeyTypes) => void
}

export const DeleteKeyPopover = ({
  nameString,
  name,
  type,
  rowId,
  deletePopoverId,
  deleting,
  onDelete,
  onOpenPopover,
}: DeleteProps) => {
  const onClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation()
    onOpenPopover(rowId, type)
  }

  return (
    <ConfirmationPopover
      anchorClassName={cx('showOnHoverKey', {
        show: deletePopoverId === rowId,
      })}
      anchorPosition="leftCenter"
      isOpen={deletePopoverId === rowId}
      closePopover={() => onOpenPopover(-1, type)}
      panelPaddingSize="l"
      button={
        <IconButton
          icon={DeleteIcon}
          onClick={onClick}
          aria-label="Delete Key"
          data-testid={`delete-key-btn-${nameString}`}
        />
      }
      onClick={(e) => e.stopPropagation()}
      title={formatLongName(nameString)}
      message="will be deleted."
      confirmButton={
        <DestructiveButton
          size="small"
          icon={DeleteIcon}
          disabled={deleting}
          onClick={() => onDelete(name)}
          data-testid="submit-delete-key"
        >
          Delete
        </DestructiveButton>
      }
    />
  )
}
