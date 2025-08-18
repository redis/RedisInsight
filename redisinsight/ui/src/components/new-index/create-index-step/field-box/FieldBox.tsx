import React from 'react'
// TODO - 18.08.25 - Replace this with local implementations
import {
  BoxSelectionGroup,
  BoxSelectionGroupItemComposeProps,
  Checkbox,
} from '@redis-ui/components'

import { RiIconButton } from 'uiBase/forms'
import { EditIcon } from 'uiBase/icons'
import { RiText } from 'uiBase/text'
import {
  BoxContent,
  BoxHeader,
  BoxHeaderActions,
  StyledFieldBox,
} from './FieldBox.styles'
import { FieldTag } from './FieldTag'
import { VectorSearchBox } from './types'

export interface FieldBoxProps extends BoxSelectionGroupItemComposeProps {
  box: VectorSearchBox
}

export const FieldBox = ({ box, ...rest }: FieldBoxProps) => {
  const { label, text, tag, disabled } = box

  return (
    <StyledFieldBox box={box} data-testid={`field-box-${box.value}`} {...rest}>
      <BoxHeader>
        <BoxSelectionGroup.Item.StateIndicator>
          {(props) => <Checkbox {...props} />}
        </BoxSelectionGroup.Item.StateIndicator>

        <BoxHeaderActions>
          <FieldTag tag={tag} />
          <RiIconButton icon={EditIcon} size="XL" disabled={disabled} />
        </BoxHeaderActions>
      </BoxHeader>
      <BoxContent>
        <RiText size="L" variant="semiBold">
          {label}
        </RiText>

        {text && (
          <RiText size="L" color="secondary" ellipsis tooltipOnEllipsis>
            {text}
          </RiText>
        )}
      </BoxContent>
    </StyledFieldBox>
  )
}
