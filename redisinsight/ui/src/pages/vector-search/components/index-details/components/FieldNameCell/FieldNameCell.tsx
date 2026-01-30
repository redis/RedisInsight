import React from 'react'
import { Text } from 'uiSrc/components/base/text'
import { FieldNameCellProps } from './FieldNameCell.types'

export const FieldNameCell = ({ field }: FieldNameCellProps) => (
  <Text
    size="M"
    ellipsis
    tooltipOnEllipsis
    data-testid={`index-details-field-name-${field.id}`}
  >
    {field.name}
  </Text>
)
