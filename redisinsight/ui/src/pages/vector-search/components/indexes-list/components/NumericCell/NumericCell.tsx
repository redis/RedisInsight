import React from 'react'

import { Text } from 'uiSrc/components/base/text'

export interface NumericCellProps {
  /** The numeric value to display */
  value: number
  /** Test ID for the cell */
  testId: string
}

const NumericCell = ({ value, testId }: NumericCellProps) => (
  <Text size="s" data-testid={testId}>
    {value.toLocaleString()}
  </Text>
)

export default NumericCell
