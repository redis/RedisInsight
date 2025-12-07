import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import CHSearchInput from './CHSearchInput'

describe('CHSearchInput', () => {
  it('should render', () => {
    expect(render(<CHSearchInput submitSearch={jest.fn()} />)).toBeTruthy()
  })

  it('should call submitSearch with after typing', () => {
    const submitSearch = jest.fn()
    render(<CHSearchInput submitSearch={submitSearch} />)
    fireEvent.change(screen.getByTestId('cli-helper-search'), {
      target: { value: 'set' },
    })
    expect(submitSearch).toBeCalledWith('set')
  })
})
