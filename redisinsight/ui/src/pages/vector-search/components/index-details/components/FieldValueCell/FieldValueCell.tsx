import React from 'react'
import { Text } from 'uiSrc/components/base/text'
import { FieldValueCellProps } from './FieldValueCell.types'

export const FieldValueCell = ({ field }: FieldValueCellProps) => (
  <Text
    size="M"
    color="secondary"
    ellipsis
    tooltipOnEllipsis
    data-testid={`index-details-field-value-${field.id}`}
  >
    {field.value}
  </Text>
)
