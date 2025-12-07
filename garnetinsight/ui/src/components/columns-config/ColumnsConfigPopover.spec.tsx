import React from 'react'
import { cleanup, render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import ColumnsConfigPopover from 'uiSrc/components/columns-config/ColumnsConfigPopover'

// Simple test columns enum/union
enum TestCol {
  A = 'a',
  B = 'b',
  C = 'c',
}

const columnsMap = new Map<TestCol, string>([
  [TestCol.A, 'Column A'],
  [TestCol.B, 'Column B'],
  [TestCol.C, 'Column C'],
])

describe('ColumnsConfigPopover', () => {
  beforeEach(() => cleanup())

  const openPopover = async () => {
    fireEvent.click(screen.getByTestId('btn-columns-config'))
    const popover = await screen.findByTestId('columns-config-popover')
    expect(popover).toBeInTheDocument()
    return popover
  }

  it('renders button and shows checkboxes with correct checked state', async () => {
    render(
      <ColumnsConfigPopover<TestCol>
        columnsMap={columnsMap}
        shownColumns={[TestCol.A, TestCol.B]}
        onChange={jest.fn()}
      />,
    )

    // Default label and button test id
    expect(screen.getByTestId('btn-columns-config')).toBeInTheDocument()
    expect(screen.getByText('Columns')).toBeInTheDocument()

    await openPopover()

    // Checked
    expect(screen.getByTestId('show-a')).toBeChecked()
    expect(screen.getByTestId('show-b')).toBeChecked()
    // Not checked
    expect(screen.getByTestId('show-c')).not.toBeChecked()
  })

  it('calls onChange with hidden diff when unchecking a checked column', async () => {
    const onChange = jest.fn()

    render(
      <ColumnsConfigPopover<TestCol>
        columnsMap={columnsMap}
        shownColumns={[TestCol.A, TestCol.B]}
        onChange={onChange}
      />,
    )

    await openPopover()

    fireEvent.click(screen.getByTestId('show-a'))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith([TestCol.B], {
      shown: [],
      hidden: [TestCol.A],
    })
  })

  it('calls onChange with shown diff when checking a hidden column', async () => {
    const onChange = jest.fn()

    render(
      <ColumnsConfigPopover<TestCol>
        columnsMap={columnsMap}
        shownColumns={[TestCol.A]}
        onChange={onChange}
      />,
    )

    await openPopover()

    fireEvent.click(screen.getByTestId('show-b'))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith([TestCol.A, TestCol.B], {
      shown: [TestCol.B],
      hidden: [],
    })
  })

  it('prevents hiding the last remaining column (disabled and no onChange)', async () => {
    const onChange = jest.fn()

    render(
      <ColumnsConfigPopover<TestCol>
        columnsMap={columnsMap}
        shownColumns={[TestCol.A]}
        onChange={onChange}
      />,
    )

    await openPopover()

    const lastCheckbox = screen.getByTestId('show-a') as HTMLInputElement
    expect(lastCheckbox).toBeDisabled()

    fireEvent.click(lastCheckbox)
    expect(onChange).not.toHaveBeenCalled()
  })
})
