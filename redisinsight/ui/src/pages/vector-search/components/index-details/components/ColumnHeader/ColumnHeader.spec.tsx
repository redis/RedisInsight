import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import { ColumnHeader } from './ColumnHeader'
import { ColumnHeaderProps } from './ColumnHeader.types'

const defaultProps: ColumnHeaderProps = {
  label: 'Test label',
  tooltip: 'Tooltip content',
}

const renderComponent = (props: Partial<ColumnHeaderProps> = {}) =>
  render(<ColumnHeader {...defaultProps} {...props} />)

describe('ColumnHeader', () => {
  it('should render the label', () => {
    renderComponent({ label: 'Field name' })

    const label = screen.getByText('Field name')
    expect(label).toBeInTheDocument()
  })

  it('should render with tooltip content', () => {
    const TooltipContent = () => <div>Custom tooltip</div>
    renderComponent({ label: 'Test label', tooltip: <TooltipContent /> })

    const label = screen.getByText('Test label')
    expect(label).toBeInTheDocument()
  })
})
