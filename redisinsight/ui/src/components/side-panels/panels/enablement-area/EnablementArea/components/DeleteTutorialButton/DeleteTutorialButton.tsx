import React, { useState } from 'react'

import { formatLongName } from 'uiSrc/utils'

import { DestructiveButton } from 'uiSrc/components/base/forms/buttons'
import { DeleteIcon } from 'uiSrc/components/base/icons'
import { Text } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { RiPopover } from 'uiSrc/components/base'

import * as LocalS from './DeleteTutorialButton.styles'
import * as S from '../../../../../SidePanels.styles'

export interface Props {
  id: string
  label: string
  isLoading?: boolean
  onDelete: (e: React.MouseEvent) => void
}

const DeleteTutorialButton = (props: Props) => {
  const { id, label, onDelete, isLoading } = props
  const [isPopoverDeleteOpen, setIsPopoverDeleteOpen] = useState<boolean>(false)

  const handleClickDelete = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.stopPropagation()
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
        <LocalS.GroupHeaderButton
          role="presentation"
          onClick={handleClickDelete}
          data-testid={`delete-tutorial-icon-${id}`}
        >
          <RiIcon size="m" type="DeleteIcon" />
        </LocalS.GroupHeaderButton>
      }
      onClick={(e) => e.stopPropagation()}
      data-testid={`delete-tutorial-popover-${id}`}
    >
      <S.PopoverDeleteContainer>
        <Text size="m" component="div">
          <h4 style={{ wordBreak: 'break-all' }}>
            <b>{formatLongName(label)}</b>
          </h4>
          <Text size="s">will be deleted.</Text>
        </Text>
        <S.PopoverFooter>
          <DestructiveButton
            size="s"
            icon={DeleteIcon}
            onClick={onDelete}
            loading={isLoading}
            data-testid={`delete-tutorial-${id}`}
          >
            Delete
          </DestructiveButton>
        </S.PopoverFooter>
      </S.PopoverDeleteContainer>
    </RiPopover>
  )
}

export default DeleteTutorialButton
