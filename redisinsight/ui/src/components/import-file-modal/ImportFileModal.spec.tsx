import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import ImportFileModal, { Props } from './ImportFileModal'

const mockProps: Props<Object> = {
  onClose: jest.fn(),
  onFileChange: jest.fn(),
  onSubmit: jest.fn(),
  title: 'title',
  submitResults: <div>submitResults</div>,
  loading: false,
  data: null,
  error: '',
  errorMessage: '',
  invalidMessage: '',
  isInvalid: false,
  isSubmitDisabled: false,
}

jest.mock('uiSrc/components/base/display', () => {
  const actual = jest.requireActual('uiSrc/components/base/display')

  return {
    ...actual,
    Modal: {
      ...actual.Modal,
      Content: {
        ...actual.Modal.Content,
        Header: {
          ...actual.Modal.Content.Header,
          Title: jest.fn().mockReturnValue(null),
        },
      },
    },
  }
})

describe('ImportFileModal', () => {
  it('should render', () => {
    expect(render(<ImportFileModal {...mockProps} />)).toBeTruthy()
  })

  it('should call onClose', () => {
    render(<ImportFileModal {...mockProps} />)

    fireEvent.click(screen.getByTestId('cancel-btn'))

    expect(mockProps.onClose).toBeCalled()
  })

  it('should call onFileChange', () => {
    render(<ImportFileModal {...mockProps} />)

    fireEvent.change(screen.getByTestId('import-file-modal-filepicker'), {
      target: { files: ['file'] },
    })

    expect(mockProps.onFileChange).toBeCalled()
  })

  it('should call onSubmit', () => {
    render(<ImportFileModal {...mockProps} />)

    fireEvent.click(screen.getByTestId('submit-btn'))

    expect(mockProps.onSubmit).toBeCalled()
  })

  // Skipping until the title issue in the modal is fixed
  it.skip('should show title before submit', () => {
    render(<ImportFileModal {...mockProps} />)

    expect(screen.getByTestId('import-file-modal-title')).toHaveTextContent(
      'title',
    )
  })

  // Skipping until the title issue in the modal is fixed
  it.skip('should show custom results title after submit', () => {
    render(
      <ImportFileModal {...mockProps} data={{}} resultsTitle="resultsTitle" />,
    )

    expect(screen.getByTestId('import-file-modal-title')).toHaveTextContent(
      'resultsTitle',
    )
  })

  // Skipping until the title issue in the modal is fixed
  it.skip('should show default results title after submit', () => {
    render(<ImportFileModal {...mockProps} data={{}} />)

    expect(screen.getByTestId('import-file-modal-title')).toHaveTextContent(
      'Import Results',
    )
  })

  it('should show submit results after submit', () => {
    render(<ImportFileModal {...mockProps} data={{}} />)

    expect(screen.getByText('submitResults')).toBeTruthy()
  })

  it('should render loading indicator', () => {
    render(<ImportFileModal {...mockProps} loading />)
    expect(screen.getByTestId('file-loading-indicator')).toBeInTheDocument()
  })

  it('should render error message', () => {
    render(<ImportFileModal {...mockProps} error="error" />)

    expect(screen.getByTestId('result-failed')).toHaveTextContent('error')
  })

  it('should render invalid message', () => {
    render(
      <ImportFileModal
        {...mockProps}
        isInvalid
        invalidMessage="invalidMessage"
      />,
    )

    expect(screen.getByTestId('input-file-error-msg')).toHaveTextContent(
      'invalidMessage',
    )
  })

  it('submit btn should be disabled without file', () => {
    render(<ImportFileModal {...mockProps} isSubmitDisabled />)

    expect(screen.getByTestId('submit-btn')).toBeDisabled()
  })

  it('submit btn should be enabled with file', () => {
    render(<ImportFileModal {...mockProps} />)

    fireEvent.change(screen.getByTestId('import-file-modal-filepicker'), {
      target: { files: ['file'] },
    })

    expect(screen.getByTestId('submit-btn')).not.toBeDisabled()
  })

  it('should render submit button with custom text', () => {
    render(<ImportFileModal {...mockProps} submitBtnText="custom text" />)

    expect(screen.getByTestId('submit-btn')).toHaveTextContent('custom text')
  })

  it('should render submit button with default text', () => {
    render(<ImportFileModal {...mockProps} />)

    expect(screen.getByTestId('submit-btn')).toHaveTextContent('Import')
  })

  it('should contain the upload warning text', () => {
    render(<ImportFileModal {...mockProps} />)

    expect(
      screen.getByText(
        'Use files only from trusted authors to avoid automatic execution of malicious code.',
      ),
    ).toBeInTheDocument()
  })
})
