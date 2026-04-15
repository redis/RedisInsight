import React from 'react'

import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { createTooltipContent, formattingBuffer } from 'uiSrc/utils'
import { TEXT_FAILED_CONVENT_FORMATTER } from 'uiSrc/constants'
import { decompressingBuffer } from 'uiSrc/utils/decompressors'
import { FormattedValue } from 'uiSrc/pages/browser/modules/key-details/shared'
import { Row } from 'uiSrc/components/base/layout/flex'
import { ElementNameCellProps } from '../../VectorSetElementList.types'

export const ElementNameCell = ({
  element,
  compressor,
  viewFormat,
}: ElementNameCellProps) => {
  const memberBuffer = element.name as RedisResponseBuffer
  const { value: decompressedItem } = decompressingBuffer(
    memberBuffer,
    compressor as any,
  )

  const { value, isValid } = formattingBuffer(
    decompressedItem as RedisResponseBuffer,
    viewFormat,
    { expanded: false },
  )

  const tooltipContent = createTooltipContent(
    value,
    decompressedItem as RedisResponseBuffer,
    viewFormat,
  )

  const testIdSuffix =
    typeof value === 'string' ? value?.substring(0, 200) : value

  return (
    <Row data-testid={`vector-set-element-value-${testIdSuffix}`}>
      <FormattedValue
        value={value}
        expanded={false}
        title={isValid ? 'Element' : TEXT_FAILED_CONVENT_FORMATTER(viewFormat)}
        tooltipContent={tooltipContent}
        position="bottom"
      />
    </Row>
  )
}
