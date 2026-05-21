import React from 'react'
import { render, screen, waitFor } from 'uiSrc/utils/test-utils'

import { AttributeEditor } from './AttributeEditor'
import { AttributeEditorProps } from './AttributeEditor.types'
import {
  ATTRIBUTES_WARNING_MESSAGE,
  JSON_VALIDATION_DEBOUNCE_MS,
} from './constants'

const queryWarning = () => screen.queryByText(ATTRIBUTES_WARNING_MESSAGE)

const defaultProps: AttributeEditorProps = {
  value: '',
  onChange: jest.fn(),
}

const renderComponent = (propsOverride?: Partial<AttributeEditorProps>) =>
  render(<AttributeEditor {...defaultProps} {...propsOverride} />)

describe('AttributeEditor', () => {
  it('should not show warning for empty value', () => {
    renderComponent({ value: '' })
    expect(queryWarning()).not.toBeInTheDocument()
  })

  it('should not show warning for valid JSON value', () => {
    renderComponent({ value: '{"status":"ok"}' })
    expect(queryWarning()).not.toBeInTheDocument()
  })

  it('should show warning immediately for non-JSON initial value', () => {
    renderComponent({ value: 'not-json' })
    expect(queryWarning()).toBeInTheDocument()
  })

  it('should toggle warning after debounce when value becomes invalid', async () => {
    const { rerender } = renderComponent({ value: '{"ok":true}' })
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
    renderComponent({ value: 'not-json', testId: 'custom' })
    expect(screen.getByTestId('custom-warning')).toBeInTheDocument()
  })
})
