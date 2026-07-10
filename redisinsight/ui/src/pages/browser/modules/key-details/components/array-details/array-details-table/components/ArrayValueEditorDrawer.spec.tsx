import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { ArrayValueEditorDrawer } from './ArrayValueEditorDrawer'

jest.mock('uiSrc/components/base/code-editor', () => {
  const ReactMock = require('react')
  return {
    __esModule: true,
    CodeEditor: (props: any) =>
      ReactMock.createElement('textarea', {
        'data-testid': 'array-value-code-editor',
        value: props.value,
        readOnly: props.options?.readOnly,
        onChange: (e: any) => props.onChange?.(e.target.value),
      }),
  }
})

const defaultProps = {
  isOpen: true,
  index: '0',
  initialValue: 'hello',
  onSave: jest.fn(),
  onClose: jest.fn(),
}

const renderComponent = (props = {}) =>
  render(<ArrayValueEditorDrawer {...defaultProps} {...props} />)

describe('ArrayValueEditorDrawer', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders nothing while closed (no Monaco instance per row)', () => {
    renderComponent({ isOpen: false })
    expect(
      screen.queryByTestId('array-value-code-editor'),
    ).not.toBeInTheDocument()
  })

  it('seeds the editor with initialValue when open', () => {
    renderComponent()
    expect(screen.getByTestId('array-value-code-editor')).toHaveValue('hello')
    // Save is never validation-gated — no disabled state to satisfy first.
    expect(screen.getByTestId('array-value-editor-save-btn')).not.toBeDisabled()
  })

  it('calls onSave with the edited value', () => {
    const onSave = jest.fn()
    renderComponent({ onSave })

    fireEvent.change(screen.getByTestId('array-value-code-editor'), {
      target: { value: 'edited value' },
    })
    fireEvent.click(screen.getByTestId('array-value-editor-save-btn'))

    expect(onSave).toHaveBeenCalledWith('edited value')
  })

  it('disables Save when isSaveDisabled is set', () => {
    renderComponent({ isSaveDisabled: true })
    expect(screen.getByTestId('array-value-editor-save-btn')).toBeDisabled()
  })

  it('makes the editor read-only while a save is in flight', () => {
    renderComponent({ isSaveDisabled: true })
    expect(screen.getByTestId('array-value-code-editor')).toHaveAttribute(
      'readonly',
    )
  })

  it('calls onClose and not onSave when cancelled', () => {
    const onSave = jest.fn()
    const onClose = jest.fn()
    renderComponent({ onSave, onClose })

    fireEvent.click(screen.getByTestId('array-value-editor-cancel-btn'))

    expect(onClose).toHaveBeenCalled()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('re-seeds the editor from initialValue when reopened', () => {
    const { rerender } = renderComponent({ initialValue: 'first' })
    fireEvent.change(screen.getByTestId('array-value-code-editor'), {
      target: { value: 'dirty' },
    })

    rerender(
      <ArrayValueEditorDrawer
        {...defaultProps}
        isOpen={false}
        initialValue="first"
      />,
    )
    rerender(
      <ArrayValueEditorDrawer {...defaultProps} isOpen initialValue="second" />,
    )

    expect(screen.getByTestId('array-value-code-editor')).toHaveValue('second')
  })
})
