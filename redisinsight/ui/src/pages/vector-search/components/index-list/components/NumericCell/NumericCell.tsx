import React from 'react'

import { Text } from 'uiSrc/components/base/text'
import { NumericCellProps } from './NumericCell.types'

export const NumericCell = ({ value, testId }: NumericCellProps) => (
  <Text size="s" data-testid={testId}>
    {value}
  </Text>
)
