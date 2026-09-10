import React, { ReactNode } from 'react'

import { RiTooltip } from 'uiSrc/components'

import { formatDateTime, relativeTime } from '../../utils/format'

export interface TimestampWithRelativeProps {
  dateTime: string
  /** Tooltip body; defaults to the relative form of `dateTime`. */
  content?: ReactNode
  'data-testid'?: string
}

/** Absolute `<time>` with the relative (or custom) detail on hover. */
const TimestampWithRelative = ({
  dateTime,
  content,
  'data-testid': dataTestId,
}: TimestampWithRelativeProps) => (
  <RiTooltip position="bottom" content={content ?? relativeTime(dateTime)}>
    <time dateTime={dateTime} data-testid={dataTestId}>
      {formatDateTime(dateTime)}
    </time>
  </RiTooltip>
)

export default TimestampWithRelative
