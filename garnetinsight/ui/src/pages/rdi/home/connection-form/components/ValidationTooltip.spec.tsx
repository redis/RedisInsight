import React from 'react'

import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import ValidationTooltip, { Props } from './ValidationTooltip'

const mockedProps: Props = {
  isValid: true,
  errors: {},
  children: <div data-testid="child" />,
}

describe('ValidationTooltip', () => {
  it('should render', () => {
    expect(render(<ValidationTooltip {...mockedProps} />)).toBeTruthy()
  })

  it('should render children', () => {
    render(<ValidationTooltip {...mockedProps} />)

    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('should not show tooltip when no errors are present', async () => {
    render(<ValidationTooltip {...mockedProps} />)

    fireEvent.focus(screen.getByTestId('child'))

    const tooltip = screen.queryByTestId('validation-errors-list')

    expect(tooltip).not.toBeInTheDocument()
  })

  it('should show tooltip when an error is present', async () => {
    render(
      <ValidationTooltip
        {...mockedProps}
        isValid={false}
        errors={{ name: 'error' }}
      />,
    )

    fireEvent.focus(screen.getByTestId('child'))

    const tooltip = await screen.findByTestId(
      'connection-form-validation-tooltip',
    )

    expect(tooltip).toHaveTextContent('Enter a value for required fields (1)')
    expect(tooltip).toHaveTextContent('error')
  })

  it('should show tooltip when multiple errors are present', async () => {
    render(
      <ValidationTooltip
        {...mockedProps}
        isValid={false}
        errors={{ name: 'error 1', url: 'error 2' }}
      />,
    )

    fireEvent.focus(screen.getByTestId('child'))

    const tooltip = await screen.findByTestId(
      'connection-form-validation-tooltip',
    )

    expect(tooltip).toHaveTextContent('Enter a value for required fields (2)')
    expect(tooltip).toHaveTextContent('error 1')
    expect(tooltip).toHaveTextContent('error 2')
  })
})
