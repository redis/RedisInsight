import React from 'react'
import { render, screen, waitFor } from 'uiSrc/utils/test-utils'

import { AttributeEditor } from './AttributeEditor'
import {
  ATTRIBUTES_WARNING_MESSAGE,
  JSON_VALIDATION_DEBOUNCE_MS,
} from './constants'

const queryWarning = () => screen.queryByText(ATTRIBUTES_WARNING_MESSAGE)

describe('AttributeEditor', () => {
  it('should not show warning for empty value', () => {
    render(<AttributeEditor value="" onChange={jest.fn()} />)
    expect(queryWarning()).not.toBeInTheDocument()
  })

  it('should not show warning for valid JSON value', () => {
    render(<AttributeEditor value='{"status":"ok"}' onChange={jest.fn()} />)
    expect(queryWarning()).not.toBeInTheDocument()
  })

  it('should show warning immediately for non-JSON initial value', () => {
    render(<AttributeEditor value="not-json" onChange={jest.fn()} />)
    expect(queryWarning()).toBeInTheDocument()
  })

  it('should toggle warning after debounce when value becomes invalid', async () => {
    const { rerender } = render(
      <AttributeEditor value='{"ok":true}' onChange={jest.fn()} />,
    )
    expect(queryWarning()).not.toBeInTheDocument()

    rerender(<AttributeEditor value="invalid-json" onChange={jest.fn()} />)

    await waitFor(
      () => {
        expect(queryWarning()).toBeInTheDocument()
      },
      { timeout: JSON_VALIDATION_DEBOUNCE_MS + 500 },
    )
  })

  it('should use provided testId as prefix for the warning', () => {
    render(
      <AttributeEditor value="not-json" onChange={jest.fn()} testId="custom" />,
    )
    expect(screen.getByTestId('custom-warning')).toBeInTheDocument()
  })
})
