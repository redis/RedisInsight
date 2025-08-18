import React from 'react'
import { RiPopover, RiPopoverProps } from 'uiBase/display'
import { RiDestructiveButton, RiIconButton } from 'uiBase/forms'
import { DeleteIcon, RiIcon } from 'uiBase/icons'

import {
  ButtonWrapper,
  IconAndTitleWrapper,
  IconWrapper,
  PopoverContent,
  Title,
} from './styles'

export type DeleteConfirmationButtonProps = Omit<
  RiPopoverProps,
  'children' | 'button'
> & {
  onConfirm: () => void
}

const DeleteConfirmationButton = ({
  onConfirm,
  ...rest
}: DeleteConfirmationButtonProps) => (
  <RiPopover
    id="manage-index-delete-confirmation"
    panelPaddingSize="none"
    anchorPosition="downCenter"
    {...rest}
    button={
      <RiIconButton
        icon={DeleteIcon}
        data-testid="manage-index-delete-btn"
      ></RiIconButton>
    }
  >
    <PopoverContent>
      <IconAndTitleWrapper>
        <IconWrapper>
          <RiIcon color="danger600" type="ToastDangerIcon" />
        </IconWrapper>

        <Title color="danger">
          Are you sure you want to delete this index?
        </Title>
      </IconAndTitleWrapper>

      <ButtonWrapper>
        <RiDestructiveButton
          onClick={onConfirm}
          data-testid="manage-index-delete-confirmation-btn"
        >
          Delete
        </RiDestructiveButton>
      </ButtonWrapper>
    </PopoverContent>
  </RiPopover>
)

export default DeleteConfirmationButton
