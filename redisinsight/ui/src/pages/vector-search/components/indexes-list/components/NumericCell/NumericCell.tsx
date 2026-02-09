import React, { useMemo } from 'react'

import { Text } from 'uiSrc/components/base/text'
import { NumericCellProps } from './NumericCell.types'

export const NumericCell = ({ value, testId }: NumericCellProps) => {
  const displayValue = useMemo(() => value, [value])

  return (
    <Text size="s" data-testid={testId}>
      {displayValue}
    </Text>
  )
}
