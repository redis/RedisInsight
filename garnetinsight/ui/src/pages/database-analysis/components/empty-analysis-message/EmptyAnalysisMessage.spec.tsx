import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import { EmptyMessage } from 'uiSrc/pages/database-analysis/constants'

import EmptyAnalysisMessage from './EmptyAnalysisMessage'

describe('EmptyAnalysisMessage', () => {
  it('should render', () => {
    expect(
      render(<EmptyAnalysisMessage name={EmptyMessage.Keys} />),
    ).toBeTruthy()
  })
})
