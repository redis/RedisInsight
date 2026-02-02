import React, { useState } from 'react'
import { formatLongName } from 'uiSrc/utils'

import {
  DestructiveButton,
  PrimaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { DeleteIcon } from 'uiSrc/components/base/icons'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { RiPopover } from 'uiSrc/components'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import * as S from '../ItemListAction.styles'

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
    <S.ActionBtn
      as={PrimaryButton}
      size="small"
      onClick={onButtonClick}
      icon={DeleteIcon}
      data-testid="delete-btn"
    >
      Delete
    </S.ActionBtn>
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
      <S.PopoverSubTitle as={Text} size="m">
        {subTitle}
      </S.PopoverSubTitle>
      <S.BoxSection>
        {selection.map((select) => (
          <S.NameList key={select.id} gap="s">
            <FlexItem>
              <RiIcon type="CheckThinIcon" />
            </FlexItem>
            <S.NameListText as={FlexItem} grow>
              <span>{formatLongName(select.name)}</span>
            </S.NameListText>
          </S.NameList>
        ))}
      </S.BoxSection>
      <S.PopoverFooter>
        <S.PopoverDeleteBtn
          as={DestructiveButton}
          size="small"
          icon={DeleteIcon}
          onClick={() => {
            closePopover()
            onDelete()
          }}
          data-testid="delete-selected-dbs"
        >
          Delete
        </S.PopoverDeleteBtn>
      </S.PopoverFooter>
    </RiPopover>
  )
}

export default DeleteAction
