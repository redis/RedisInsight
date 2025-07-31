import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import BrowserSearchPanel, { Props } from './BrowserSearchPanel'

const mockedProps: Props = {
  handleCreateIndexPanel: jest.fn,
}
describe('BrowserSearchPanel', () => {
  it('should render', () => {
    expect(render(<BrowserSearchPanel {...mockedProps} />)).toBeTruthy()
  })

  it('should render search properly', () => {
    render(<BrowserSearchPanel {...mockedProps} />)
    const searchInput = screen.queryByTestId('search-key')
    expect(searchInput).toBeInTheDocument()
  })
})
