import React from 'react'
import { mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import BulkDeleteFooter, { Props } from './BulkDeleteFooter'
import { setBulkDeleteGenerateReport } from 'uiSrc/slices/browser/bulkActions'

jest.mock('uiSrc/slices/browser/bulkActions', () => ({
  ...jest.requireActual('uiSrc/slices/browser/bulkActions'),
  setBulkDeleteGenerateReport: jest.fn().mockReturnValue({
    type: 'bulkActions/setBulkDeleteGenerateReport',
  }),
}))

const mockedProps = {
  ...mock<Props>(),
}

describe('BulkDeleteFooter', () => {
  it('should render', () => {
    expect(render(<BulkDeleteFooter {...mockedProps} />)).toBeTruthy()
  })

  it('should call onCancel prop when click on Cancel btn', () => {
    const mockOnCancel = jest.fn()
    render(<BulkDeleteFooter {...mockedProps} onCancel={mockOnCancel} />)

    fireEvent.click(screen.getByTestId('bulk-action-cancel-btn'))

    expect(mockOnCancel).toBeCalled()
  })

  it('should render download report checkbox', () => {
    render(<BulkDeleteFooter {...mockedProps} />)

    expect(screen.getByTestId('download-report-checkbox')).toBeInTheDocument()
  })

  it('should dispatch setBulkDeleteGenerateReport when checkbox is toggled', () => {
    render(<BulkDeleteFooter {...mockedProps} />)

    fireEvent.click(screen.getByTestId('download-report-checkbox'))

    expect(setBulkDeleteGenerateReport).toHaveBeenCalledWith(false)
  })
})
