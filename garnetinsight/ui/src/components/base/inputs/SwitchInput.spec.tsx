import React from 'react'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/react'

import SwitchInput from './SwitchInput'

describe('SwitchInput', () => {
  it('should render with default props', () => {
    const { container } = render(<SwitchInput title="On" />)

    expect(container.firstChild).toHaveTextContent('On')
  })

  it('should render with titleOff when provided', () => {
    const { container } = render(
      <SwitchInput title="On" titleOff="Off" checked={false} />,
    )

    expect(container.firstChild).toHaveTextContent('Off')
  })

  it('should fall back to title when titleOff is not provided', () => {
    const { container } = render(<SwitchInput title="On" checked={false} />)

    expect(container.firstChild).toHaveTextContent('On')
  })

  it('should call onCheckedChange when toggled', async () => {
    const onCheckedChange = jest.fn()
    const { getByRole, container } = render(
      <SwitchInput title="On" onCheckedChange={onCheckedChange} />,
    )

    expect(container.firstChild).toHaveTextContent('On')

    const switchElement = getByRole('switch')
    await userEvent.click(switchElement)

    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(container.firstChild).toHaveTextContent('On')
  })

  it('should apply custom styles', () => {
    const { container } = render(
      <SwitchInput title="On" style={{ backgroundColor: 'red' }} />,
    )
    expect(container.firstChild).toHaveStyle('background-color: red')
  })
})
