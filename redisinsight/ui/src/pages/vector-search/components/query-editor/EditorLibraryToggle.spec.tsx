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

    const editorButton = screen.getByRole('button', { name: /Query editor/i })
    const libraryButton = screen.getByRole('button', {
      name: /Query library/i,
    })

    expect(editorButton).toBeInTheDocument()
    expect(libraryButton).toBeInTheDocument()
  })

  it('should call onChangeTab with Library when Query library toggle is clicked', () => {
    render(<EditorLibraryToggle {...defaultProps} />)

    const libraryButton = screen.getByRole('button', {
      name: /Query library/i,
    })
    fireEvent.click(libraryButton)

    expect(defaultProps.onChangeTab).toHaveBeenCalledWith(EditorTab.Library)
  })

  it('should call onChangeTab with Editor when Query editor toggle is clicked', () => {
    render(
      <EditorLibraryToggle {...defaultProps} activeTab={EditorTab.Library} />,
    )

    const editorButton = screen.getByRole('button', { name: /Query editor/i })
    fireEvent.click(editorButton)

    expect(defaultProps.onChangeTab).toHaveBeenCalledWith(EditorTab.Editor)
  })
})
