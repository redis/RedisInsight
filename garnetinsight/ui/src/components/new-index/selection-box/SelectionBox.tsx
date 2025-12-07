import React, { HTMLAttributes } from 'react'
import { BoxSelectionGroup, BoxSelectionGroupBox } from '@redis-ui/components'
import {
  DisabledBar,
  StyledBoxContent,
  StyledText,
  StyledTitle,
} from './SelectionBox.styles'

export interface BoxSelectionOption<T extends string = string>
  extends BoxSelectionGroupBox<T> {
  text?: string
}

type SelectionBoxProps<T extends string = string> = {
  box: BoxSelectionOption<T>
} & HTMLAttributes<HTMLButtonElement>

const SelectionBox = <T extends string = string>({
  box,
  ...rest
}: SelectionBoxProps<T>) => {
  const { label, text, disabled } = box

  return (
    <BoxSelectionGroup.Item.Compose box={box} {...rest}>
      {disabled && <DisabledBar />}

      <StyledBoxContent>
        <BoxSelectionGroup.Item.Icon color="neutral700" customSize="32px" />

        <StyledTitle size="S">{label}</StyledTitle>
        {text && <StyledText size="M">{text}</StyledText>}
      </StyledBoxContent>
    </BoxSelectionGroup.Item.Compose>
  )
}

export default SelectionBox
