import React from 'react'
import { render, screen, fireEvent, act } from 'uiSrc/utils/test-utils'

import UploadTutorialForm from './UploadTutorialForm'

describe('UploadTutorialForm', () => {
  it('should render', () => {
    expect(render(<UploadTutorialForm onSubmit={jest.fn()} />)).toBeTruthy()
  })

  it('should render disabled submit button by default', () => {
    render(<UploadTutorialForm onSubmit={jest.fn()} />)
    expect(screen.getByTestId('submit-upload-tutorial-btn')).toBeDisabled()
  })

  it('should call onSubmit with proper data', async () => {
    const mockOnSubmit = jest.fn()
    render(<UploadTutorialForm onSubmit={mockOnSubmit} />)

    const jsonString = JSON.stringify({})
    const blob = new Blob([jsonString])
    const file = new File([blob], 'file', {
      type: 'application/JSON',
    })

    await act(() => {
      fireEvent.change(screen.getByTestId('import-tutorial'), {
        target: { files: [file] },
      })
    })

    await act(() => {
      fireEvent.click(screen.getByTestId('submit-upload-tutorial-btn'))
    })

    expect(mockOnSubmit).toBeCalledWith({ file: expect.any(Object), link: '' })
  })

  it('should call onSubmit with proper data without file', async () => {
    const mockOnSubmit = jest.fn()
    render(<UploadTutorialForm onSubmit={mockOnSubmit} />)

    await act(() => {
      fireEvent.change(screen.getByTestId('tutorial-link-field'), {
        target: { value: 'link' },
      })
    })

    await act(() => {
      fireEvent.click(screen.getByTestId('submit-upload-tutorial-btn'))
    })

    expect(mockOnSubmit).toBeCalledWith({ file: null, link: 'link' })
  })

  it('should call onCancel', () => {
    const onCancel = jest.fn()
    render(<UploadTutorialForm onSubmit={jest.fn()} onCancel={onCancel} />)

    fireEvent.click(screen.getByTestId('cancel-upload-tutorial-btn'))
    expect(onCancel).toBeCalled()
  })
})
