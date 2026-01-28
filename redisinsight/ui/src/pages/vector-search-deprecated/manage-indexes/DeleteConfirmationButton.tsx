import React from 'react'
import { RiPopover, RiPopoverProps } from 'uiSrc/components'
import { Button, IconButton } from 'uiSrc/components/base/forms/buttons'
import {
  ButtonWrapper,
  IconAndTitleWrapper,
  IconWrapper,
  PopoverContent,
  Title,
} from './styles'
import { DeleteIcon, RiIcon } from 'uiSrc/components/base/icons'

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
      <IconButton
        icon={DeleteIcon}
        data-testid="manage-index-delete-btn"
      ></IconButton>
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
        <Button
          variant="destructive"
          onClick={onConfirm}
          data-testid="manage-index-delete-confirmation-btn"
        >
          Delete
        </Button>
      </ButtonWrapper>
    </PopoverContent>
  </RiPopover>
)

export default DeleteConfirmationButton
