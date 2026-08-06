import React from 'react'

import { cleanup, render, screen } from 'uiSrc/utils/test-utils'

import { formatDateTime } from '../../utils/format'
import TimestampWithRelative, {
  TimestampWithRelativeProps,
} from './TimestampWithRelative'

describe('TimestampWithRelative', () => {
  const defaultProps: TimestampWithRelativeProps = {
    dateTime: '2026-01-15T10:30:00.000Z',
    'data-testid': 'timestamp',
  }

  const renderComponent = (
    propsOverride?: Partial<TimestampWithRelativeProps>,
  ) => render(<TimestampWithRelative {...defaultProps} {...propsOverride} />)

  beforeEach(() => {
    cleanup()
  })

  it('should render the formatted absolute time in a <time> element', () => {
    renderComponent()

    const time = screen.getByTestId('timestamp')
    expect(time.tagName).toBe('TIME')
    expect(time).toHaveAttribute('dateTime', defaultProps.dateTime)
    expect(time).toHaveTextContent(formatDateTime(defaultProps.dateTime))
  })

  it('should render the placeholder for an invalid date', () => {
    renderComponent({ dateTime: 'not-a-date' })

    expect(screen.getByTestId('timestamp')).toHaveTextContent('-')
  })
})
