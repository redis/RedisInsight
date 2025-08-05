import React from 'react'

import cx from 'classnames'
import { KeyTypes, ModulesKeyTypes } from 'uiSrc/constants'
import { formatLongName } from 'uiSrc/utils'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import { RiDestructiveButton, RiIconButton } from 'uiSrc/components/base/forms'
import { DeleteIcon } from 'uiSrc/components/base/icons'
import { Text } from 'uiSrc/components/base/text'
import { RiPopover } from 'uiSrc/components/base'

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
      <Text size="m" component="div">
        <h4 style={{ wordBreak: 'break-all' }}>
          <b>{formatLongName(nameString)}</b>
        </h4>
        <Text size="s">will be deleted.</Text>
      </Text>
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
