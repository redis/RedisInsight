import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import DatabaseNotOpened from './DatabaseNotOpened'

describe('DatabaseNotOpened', () => {
  it('should render', () => {
    expect(render(<DatabaseNotOpened />)).toBeTruthy()
  })

  it('should render links', () => {
    render(<DatabaseNotOpened />)

    expect(screen.getByTestId('tutorials-get-started-link')).toBeInTheDocument()
    expect(screen.getByTestId('tutorials-docker-link')).toBeInTheDocument()
  })
})
