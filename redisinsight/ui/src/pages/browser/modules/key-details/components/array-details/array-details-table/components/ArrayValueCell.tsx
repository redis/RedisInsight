import React from 'react'

import { Text } from 'uiSrc/components/base/text'
import {
  KeyValueCompressor,
  KeyValueFormat,
  TEXT_FAILED_CONVENT_FORMATTER,
} from 'uiSrc/constants'
import { createTooltipContent, formattingBuffer, Nullable } from 'uiSrc/utils'
import { decompressingBuffer } from 'uiSrc/utils/decompressors'
import { FormattedValue } from 'uiSrc/pages/browser/modules/key-details/shared'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { ArrayDataElement } from 'uiSrc/slices/interfaces/array'

interface ArrayValueCellProps {
  index: string
  value: ArrayDataElement['value']
  compressor: Nullable<KeyValueCompressor>
  viewFormat: KeyValueFormat
}

const TEST_ID_PREFIX = 'array-details-table'

/**
 * Renders a populated array slot's value through the standard buffer →
 * decompress → format pipeline. For empty slots (null from ARGETRANGE,
 * or an absent `value` field from a serialization edge case) renders a
 * muted "(empty)" marker instead of running it through the formatter
 * chain.
 */
export const ArrayValueCell = ({
  index,
  value,
  compressor,
  viewFormat,
}: ArrayValueCellProps) => {
  // Treat null and undefined identically — `JSON.stringify` drops keys
  // whose values are undefined, so an undefined `value` here means the
  // slot arrived without a buffer payload.
  if (value == null) {
    return (
      <Text color="subdued" data-testid={`${TEST_ID_PREFIX}-empty-${index}`}>
        (empty)
      </Text>
    )
  }

  // Values flow through the API in `encoding=buffer` mode, so we narrow
  // RedisString to RedisResponseBuffer at the rendering boundary.
  const buffer = value as RedisResponseBuffer
  const { value: decompressed } = decompressingBuffer(buffer, compressor)
  const decompressedBuffer = decompressed as RedisResponseBuffer
  const { value: formatted, isValid } = formattingBuffer(
    decompressedBuffer,
    viewFormat,
    { expanded: false },
  )
  const tooltipContent = createTooltipContent(
    formatted,
    decompressedBuffer,
    viewFormat,
  )

  return (
    <div
      className="innerCellAsCell"
      data-testid={`${TEST_ID_PREFIX}-value-${index}`}
    >
      <FormattedValue
        value={formatted}
        expanded={false}
        title={isValid ? 'Value' : TEXT_FAILED_CONVENT_FORMATTER(viewFormat)}
        tooltipContent={tooltipContent}
        position="bottom"
      />
    </div>
  )
}
