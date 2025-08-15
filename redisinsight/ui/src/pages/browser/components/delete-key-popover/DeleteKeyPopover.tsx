import React from 'react'

import cx from 'classnames'
import { RiSpacer } from 'uiBase/layout'
import { RiDestructiveButton, RiIconButton } from 'uiBase/forms'
import { DeleteIcon } from 'uiBase/icons'
import { RiText } from 'uiBase/text'
import { RiPopover } from 'uiBase/display'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { formatLongName } from 'uiSrc/utils'
import { KeyTypes, ModulesKeyTypes } from 'uiSrc/constants'

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
}: DeleteProps) => (
  <RiPopover
    anchorClassName={cx('showOnHoverKey', { show: deletePopoverId === rowId })}
    anchorPosition="leftUp"
    isOpen={deletePopoverId === rowId}
    closePopover={() => onOpenPopover(-1, type)}
    panelPaddingSize="l"
    button={
      <RiIconButton
        icon={DeleteIcon}
        onClick={() => onOpenPopover(rowId, type)}
        aria-label="Delete Key"
        data-testid={`delete-key-btn-${nameString}`}
      />
    }
    onClick={(e) => e.stopPropagation()}
  >
    <>
      <RiText size="m" component="div">
        <h4 style={{ wordBreak: 'break-all' }}>
          <b>{formatLongName(nameString)}</b>
        </h4>
        <RiText size="s">will be deleted.</RiText>
      </RiText>
      <RiSpacer size="m" />
      <RiDestructiveButton
        size="small"
        icon={DeleteIcon}
        disabled={deleting}
        onClick={() => onDelete(name)}
        data-testid="submit-delete-key"
      >
        Delete
      </RiDestructiveButton>
    </>
  </RiPopover>
)
