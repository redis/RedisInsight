import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import RdiDeployErrorContent from './RdiDeployErrorContent'

describe('RdiDeployErrorContent', () => {
  const mockMessage = 'Test error log content'

  beforeEach(() => {
    jest.spyOn(URL, 'createObjectURL').mockImplementation(() => 'mock-url')
    jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders the error message and download button', () => {
    render(<RdiDeployErrorContent message={mockMessage} />)

    expect(
      screen.getByText('Review the error log for details.'),
    ).toBeInTheDocument()
    const downloadButton = screen.getByTestId('donwload-log-file-btn')
    expect(downloadButton).toBeInTheDocument()
    expect(downloadButton).toHaveAttribute('href', 'mock-url')
    expect(downloadButton).toHaveAttribute('download', 'error-log.txt')
  })

  it('creates and revokes the object URL properly', () => {
    const { unmount } = render(<RdiDeployErrorContent message={mockMessage} />)

    expect(URL.createObjectURL).toHaveBeenCalled()
    unmount()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('mock-url')
  })
})
