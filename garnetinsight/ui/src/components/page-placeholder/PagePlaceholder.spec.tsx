import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import PagePlaceholder from './PagePlaceholder'

describe('PagePlaceholder', () => {
  it('should render', () => {
    expect(render(<PagePlaceholder />)).toBeTruthy()
  })
})
