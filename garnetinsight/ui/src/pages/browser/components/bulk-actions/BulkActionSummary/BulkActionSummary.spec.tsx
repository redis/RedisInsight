import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import BulkActionSummary from './BulkActionSummary'

describe('BulkActionSummary', () => {
  it('should render', () => {
    render(
      <BulkActionSummary
        succeed={10}
        failed={1}
        duration={10}
        processed={100}
        data-testid="testid"
      />,
    )

    expect(screen.getByTestId('testid')).toBeInTheDocument()

    expect(screen.getByTestId('testid')).toHaveTextContent(
      '100Keys Processed10Success1Errors0:00:00.010Time Taken',
    )
  })
})
