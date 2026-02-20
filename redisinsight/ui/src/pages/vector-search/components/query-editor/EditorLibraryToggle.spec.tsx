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

    expect(
      screen.getByRole('button', { name: /Query editor/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Query library/i }),
    ).toBeInTheDocument()
  })

  it('should call onChangeTab with Library when Query library toggle is clicked', () => {
    render(<EditorLibraryToggle {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: /Query library/i }))
    expect(defaultProps.onChangeTab).toHaveBeenCalledWith(EditorTab.Library)
  })

  it('should call onChangeTab with Editor when Query editor toggle is clicked', () => {
    render(
      <EditorLibraryToggle {...defaultProps} activeTab={EditorTab.Library} />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Query editor/i }))
    expect(defaultProps.onChangeTab).toHaveBeenCalledWith(EditorTab.Editor)
  })
})
