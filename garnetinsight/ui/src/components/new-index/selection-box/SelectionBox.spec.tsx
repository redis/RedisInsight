import React from 'react'
import { BoxSelectionGroup } from '@redis-ui/components'

import { cleanup, render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import SelectionBox from './SelectionBox'

const mockBox = {
  value: 'rqe',
  label: 'Test Label',
  text: 'Test Description',
}

const renderWithBoxSelectionGroup = (ui: React.ReactElement) =>
  render(<BoxSelectionGroup.Compose>{ui}</BoxSelectionGroup.Compose>)

describe('SelectionBox', () => {
  beforeEach(() => {
    cleanup()
  })

  it('should render label and text', () => {
    renderWithBoxSelectionGroup(<SelectionBox box={mockBox} />)

    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('should render label without text when text is not provided', () => {
    renderWithBoxSelectionGroup(
      <SelectionBox box={{ ...mockBox, text: undefined }} />,
    )

    expect(screen.getByText(mockBox.label)).toBeInTheDocument()
    expect(screen.queryByText(mockBox.text)).not.toBeInTheDocument()
  })

  it('should show disabled bar when disabled is true', () => {
    renderWithBoxSelectionGroup(
      <SelectionBox box={{ ...mockBox, disabled: true }} />,
    )

    expect(screen.getByText(/coming soon/i)).toBeInTheDocument()
  })

  it('should not show disabled bar when disabled is false', () => {
    renderWithBoxSelectionGroup(
      <SelectionBox box={{ ...mockBox, disabled: false }} />,
    )

    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument()
  })

  it('should call onClick handler when clicked', () => {
    const onClick = jest.fn()

    renderWithBoxSelectionGroup(
      <SelectionBox box={mockBox} onClick={onClick} />,
    )

    fireEvent.click(screen.getByText(mockBox.label))

    expect(onClick).toHaveBeenCalled()
  })
})
