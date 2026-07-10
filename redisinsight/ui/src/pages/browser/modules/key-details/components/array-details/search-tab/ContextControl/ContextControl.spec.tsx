import React from 'react'
import {
  fireEvent,
  render,
  screen,
  userEvent,
  waitFor,
} from 'uiSrc/utils/test-utils'

import { ContextControl } from './ContextControl'
import { ContextControlProps } from './ContextControl.types'

const defaultProps: ContextControlProps = {
  context: { enabled: false, count: 5 },
  onChange: jest.fn(),
}

const renderComponent = (props: Partial<ContextControlProps> = {}) =>
  render(<ContextControl {...defaultProps} {...props} />)

describe('ContextControl', () => {
  it('keeps the count input disabled until the toggle is ticked', () => {
    const { rerender } = renderComponent()
    // Off by default → input present (so layout is stable) but disabled.
    expect(screen.getByTestId('array-context-control-count')).toBeDisabled()

    rerender(
      <ContextControl
        {...defaultProps}
        context={{ enabled: true, count: 5 }}
      />,
    )
    expect(screen.getByTestId('array-context-control-count')).toBeEnabled()
  })

  it('reports enabled when the toggle is ticked', () => {
    const onChange = jest.fn()
    renderComponent({ onChange })

    fireEvent.click(screen.getByTestId('array-context-control-toggle'))

    expect(onChange).toHaveBeenCalledWith({ enabled: true })
  })

  it('shows the passed count and clamps a typed value above the max to 50', async () => {
    const user = userEvent.setup()
    renderComponent({ context: { enabled: true, count: 5 } })

    const input = screen.getByTestId('array-context-control-count')
    // redis-ui NumericInput renders a text input, so the DOM value is a string.
    expect(input).toHaveValue('5')

    // autoValidate clamps onChange, but the field text only settles to the
    // clamped value on blur — so '99' stays verbatim while typing and resolves
    // to '50' once the input blurs.
    await user.clear(input)
    await user.type(input, '99')
    await user.tab()

    await waitFor(() => {
      expect(input).toHaveValue('50')
    })
  })

  it('reports a new count via onChange', () => {
    const onChange = jest.fn()
    renderComponent({ context: { enabled: true, count: 5 }, onChange })

    fireEvent.change(screen.getByTestId('array-context-control-count'), {
      target: { value: '8' },
    })

    expect(onChange).toHaveBeenCalledWith({ count: 8 })
  })

  it('disables both the toggle and the input when disabled', () => {
    renderComponent({ context: { enabled: true, count: 5 }, disabled: true })

    expect(screen.getByTestId('array-context-control-toggle')).toBeDisabled()
    expect(screen.getByTestId('array-context-control-count')).toBeDisabled()
  })
})
