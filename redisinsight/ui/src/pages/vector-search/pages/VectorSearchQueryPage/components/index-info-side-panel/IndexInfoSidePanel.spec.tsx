import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { IndexInfoSidePanel } from './IndexInfoSidePanel'
import { IndexInfoSidePanelProps } from './IndexInfoSidePanel.types'

jest.mock('../../../../hooks', () => ({
  useIndexInfo: jest.fn().mockReturnValue({
    indexInfo: null,
    loading: false,
    error: null,
    refetch: jest.fn(),
  }),
}))

describe('IndexInfoSidePanel', () => {
  const defaultProps: IndexInfoSidePanelProps = {
    onClose: jest.fn(),
  }

  const renderComponent = (
    propsOverride?: Partial<IndexInfoSidePanelProps>,
  ) => {
    const props = { ...defaultProps, ...propsOverride }
    return render(<IndexInfoSidePanel {...props} />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render panel with header and close button', () => {
    renderComponent()

    const panel = screen.getByTestId('view-index-panel')
    const title = screen.getByText('View index')
    const closeBtn = screen.getByTestId('close-index-panel-btn')

    expect(panel).toBeInTheDocument()
    expect(title).toBeInTheDocument()
    expect(closeBtn).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', () => {
    const mockOnClose = jest.fn()
    renderComponent({ onClose: mockOnClose })

    const closeBtn = screen.getByTestId('close-index-panel-btn')
    fireEvent.click(closeBtn)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })
})
