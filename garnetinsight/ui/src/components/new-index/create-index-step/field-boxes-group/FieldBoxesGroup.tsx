import React from 'react'
import { MultiBoxSelectionGroupProps } from '@redis-ui/components'
import { StyledFieldBoxesGroup } from './FieldBoxesGroup.styles'
import { VectorSearchBox } from '../field-box/types'
import { FieldBox } from '../field-box/FieldBox'

export interface FieldBoxesGroupProps extends MultiBoxSelectionGroupProps {
  boxes: VectorSearchBox[]
  value: string[]
  onChange: (value: string[] | undefined) => void
}

export const FieldBoxesGroup = ({
  boxes,
  value,
  onChange,
  ...rest
}: FieldBoxesGroupProps) => (
  <StyledFieldBoxesGroup
    value={value}
    onChange={onChange}
    data-testid="field-boxes-group"
    {...rest}
  >
    {boxes.map((box) => (
      <FieldBox key={box.value} box={box} />
    ))}
  </StyledFieldBoxesGroup>
)
