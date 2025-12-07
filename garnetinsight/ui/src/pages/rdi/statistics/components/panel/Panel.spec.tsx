import React from 'react'

import { render } from 'uiSrc/utils/test-utils'
import Panel from './Panel'

describe('Panel', () => {
  it('renders children correctly', () => {
    const { getByText } = render(<Panel>Test Content</Panel>)
    expect(getByText('Test Content')).toBeInTheDocument()
  })
})
