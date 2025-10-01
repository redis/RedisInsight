import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import ExternalLink from './ExternalLink'

describe('ExternalLink', () => {
  it('should render', () => {
    expect(render(<ExternalLink href="https://redis.com" />)).toBeTruthy()
  })
})
