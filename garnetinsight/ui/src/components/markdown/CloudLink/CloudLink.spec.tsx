import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import CloudLink from './CloudLink'

describe('CloudLink', () => {
  it('should render', () => {
    expect(render(<CloudLink text="Link" url="" />)).toBeTruthy()
  })

  it('should render proper url', () => {
    const url = 'https://site.com'
    render(<CloudLink text="Link" url={url} />)

    expect(
      screen.getByTestId('guide-free-database-link').getAttribute('href'),
    ).toBe(url)
  })
})
