import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { EditorLibraryToggle } from './EditorLibraryToggle'
import { EditorTab } from './QueryEditor.types'

describe('EditorLibraryToggle', () => {
  const defaultProps = {
    activeTab: EditorTab.Editor,
    onChangeTab: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render toggle buttons', () => {
    render(<EditorLibraryToggle {...defaultProps} />)

    expect(screen.getByRole('tab', { name: 'Editor' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Library' })).toBeInTheDocument()
  })

  it('should call onChangeTab with Library when Library toggle is clicked', () => {
    render(<EditorLibraryToggle {...defaultProps} />)

    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Library' }))
    expect(defaultProps.onChangeTab).toHaveBeenCalledWith(EditorTab.Library)
  })

  it('should call onChangeTab with Editor when Editor toggle is clicked', () => {
    render(
      <EditorLibraryToggle {...defaultProps} activeTab={EditorTab.Library} />,
    )

    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Editor' }))
    expect(defaultProps.onChangeTab).toHaveBeenCalledWith(EditorTab.Editor)
  })
})
