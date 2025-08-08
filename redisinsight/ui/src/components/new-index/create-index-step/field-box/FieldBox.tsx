import React from 'react'
import {
  BoxSelectionGroup,
  BoxSelectionGroupItemComposeProps,
  Checkbox,
} from '@redis-ui/components'

import { EditIcon } from 'uiSrc/components/base/icons'
import { IconButton } from 'uiSrc/components/base/forms/buttons/IconButton'
import { Text } from 'uiSrc/components/base/text'

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
          <IconButton icon={EditIcon} size="XL" disabled={disabled} />
        </BoxHeaderActions>
      </BoxHeader>
      <BoxContent>
        <Text size="L" variant="semiBold">
          {label}
        </Text>

        {text && (
          <Text size="L" color="secondary" ellipsis tooltipOnEllipsis>
            {text}
          </Text>
        )}
      </BoxContent>
    </StyledFieldBox>
  )
}
