import React from 'react'
import { act } from '@testing-library/react'
import {
  fireEvent,
  render,
  screen,
  waitForRiTooltipVisible,
} from 'uiSrc/utils/test-utils'
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
    renderComponent({ label: 'Index name' })

    const label = screen.getByText('Index name')
    expect(label).toBeInTheDocument()
  })

  it('should render with tooltip content', () => {
    const TooltipContent = () => <div>Custom tooltip</div>
    renderComponent({ label: 'Test label', tooltip: <TooltipContent /> })

    const label = screen.getByText('Test label')
    expect(label).toBeInTheDocument()
  })

  it('should show tooltip content when info icon is focused', async () => {
    renderComponent({
      label: 'Index prefix',
      tooltip: 'Keys matching this prefix are automatically indexed.',
    })

    const header = screen.getByText('Index prefix')
    const infoIcon = header.parentElement?.querySelector('svg') as Element

    await act(async () => {
      fireEvent.focus(infoIcon)
    })
    await waitForRiTooltipVisible()

    const tooltipContent = screen.getAllByText(
      'Keys matching this prefix are automatically indexed.',
    )[0]
    expect(tooltipContent).toBeInTheDocument()
  })
})
