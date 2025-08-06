import React from 'react'

import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { mockModal } from 'uiSrc/mocks/components/modal'
import UploadDialog, { Props } from './UploadDialog'

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineSelector: jest.fn().mockReturnValue({
    loading: false,
  }),
}))

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useFormikContext: jest.fn().mockReturnValue({
    values: {
      config: 'value',
      jobs: [
        { name: 'job1', value: 'value' },
        { name: 'job2', value: 'value' },
      ],
    },
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiBase/display', () => {
  const actual = jest.requireActual('uiBase/display')

  return mockModal(actual)
})

const mockedProps: Props = {
  onClose: jest.fn(),
  onConfirm: jest.fn(),
  onFileChange: jest.fn(),
  isUploaded: false,
  showWarning: false,
  loading: false,
}

describe('UploadDialog', () => {
  it('should render', () => {
    expect(render(<UploadDialog {...mockedProps} />)).toBeTruthy()
  })

  it('should disable upload button when no file is selected', () => {
    render(<UploadDialog {...mockedProps} />)

    expect(screen.getByTestId('submit-btn')).toBeDisabled()
  })

  it('should enable upload button when file is selected', () => {
    render(<UploadDialog {...mockedProps} />)

    fireEvent.change(screen.getByTestId('import-file-modal-filepicker'), {
      target: { files: ['file'] },
    })

    expect(screen.getByTestId('submit-btn')).not.toBeDisabled()
  })

  it('should render warning message', () => {
    render(<UploadDialog {...mockedProps} showWarning />)

    expect(screen.getByTestId('input-file-warning')).toBeInTheDocument()
  })

  it('should only allow .zip files', () => {
    render(<UploadDialog {...mockedProps} />)

    expect(screen.getByTestId('import-file-modal-filepicker')).toHaveAttribute(
      'accept',
      '.zip',
    )
  })

  // Skipping until the title issue in the modal is fixed
  it.skip('should show custom results success title after submit', () => {
    render(<UploadDialog {...mockedProps} isUploaded />)

    expect(screen.getByTestId('import-file-modal-title')).toHaveTextContent(
      'Pipeline has been uploaded',
    )
  })

  // Skipping until the title issue in the modal is fixed
  it.skip('should show custom results failed title after submit', () => {
    render(<UploadDialog {...mockedProps} isUploaded error="error" />)

    expect(screen.getByTestId('import-file-modal-title')).toHaveTextContent(
      'Failed to upload pipeline',
    )
  })

  it('should show results after submit', () => {
    render(<UploadDialog {...mockedProps} isUploaded />)

    expect(screen.getByTestId('result-succeeded')).toHaveTextContent(
      'A new pipeline has been successfully uploaded.',
    )
  })

  it('should show error message when error is present', () => {
    render(<UploadDialog {...mockedProps} error="error" />)

    expect(screen.getByTestId('result-failed')).toHaveTextContent(
      'There was a problem with the .zip file',
    )
    expect(screen.getByTestId('result-failed')).toHaveTextContent('error')
  })
})
