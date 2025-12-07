import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import UploadWarning from './UploadWarning'

describe('UploadWarning', () => {
  it('should render', () => {
    expect(render(<UploadWarning />)).toBeTruthy()
  })

  it('should contain the upload warning text', () => {
    render(<UploadWarning />)

    expect(
      screen.getByText(
        'Use files only from trusted authors to avoid automatic execution of malicious code.',
      ),
    ).toBeInTheDocument()
  })
})
